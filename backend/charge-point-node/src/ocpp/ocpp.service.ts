import { Logger, Injectable, OnApplicationBootstrap, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { BootNotificationRequest, BootNotificationResponse, HeartbeatRequest, HeartbeatResponse, OcppClientConnection, OcppServer, UnlockConnectorRequest, UnlockConnectorResponse, AuthorizeResponse, AuthorizeRequest, StartTransactionRequest, StartTransactionResponse, StopTransactionRequest, StopTransactionResponse } from 'ocpp-ts';
import { Model } from 'mongoose';
import { MongoError } from 'mongodb';
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";
import { ChargePoint } from './schemas/charge.point.schemas';
import { CreateCPDto,Status,Connector } from './dtos/create.cp.dto';

const scrypt = promisify(_scrypt);

interface ChargePointData {
    chargePoints: { [cpId: string]: {
        chargePoint: ChargePoint;
        connectorStatus: { [connectorId: number]: Status };
        transactions: { 
            authorization: AuthorizeResponse,
            start: StartTransactionResponse,
            end: StopTransactionResponse
        } ;
    } };
}

@Injectable()
export class OcppService implements OnApplicationBootstrap {
    private data: ChargePointData = {
        chargePoints: {},
    };

    constructor(
        private readonly MyOcppServer: OcppServer,
        private readonly amqpConnection: AmqpConnection,
        @InjectModel(ChargePoint.name) private readonly chargePointModel: Model<ChargePoint>,
    ) { }

    private readonly logger = new Logger(OcppService.name);

    async onApplicationBootstrap() {
        this.MyOcppServer.listen(9210);
        this.logger.log('Server1.6 listening on port 9210');

        this.MyOcppServer.on('connection', (client: OcppClientConnection) => {
            this.logger.log(`Client ${client.getCpId()} connected`);

            client.on('close', async (code: number, reason: Buffer) => {
                this.logger.log(`Client ${client.getCpId()} closed connection`, code, reason.toString());
                const chargePointData = this.data.chargePoints[client.getCpId()];
                if (!chargePointData) {
                    this.logger.error(`Charge point with ID ${client.getCpId()} not found`);
                    return;
                }
                const chargePoint = chargePointData.chargePoint;
                await this.chargePointModel.updateOne({ _id: chargePoint._id }, { status: Status.Unavailable });
                this.data.chargePoints[client.getCpId()] = undefined;
            });

            client.on('BootNotification', async (request: BootNotificationRequest, cb: (response: BootNotificationResponse) => void) => {
                const serial_number = request.chargePointSerialNumber;
                const chargePoint = await this.findBySerialNumber(serial_number);
                if (!chargePoint) {
                    this.logger.error(`Charge point with serial number ${serial_number} not found`);
                    return;
                }
                await this.chargePointModel.updateOne({ _id: chargePoint._id }, { status: Status.Available });

                this.data.chargePoints[client.getCpId()] = {
                    chargePoint: chargePoint,
                    connectorStatus: {},
                    transactions: {
                        authorization: {
                            idTagInfo: {
                                status: 'Invalid'
                            }
                        },
                        start: {
                            transactionId: 0,
                            idTagInfo: {
                                status: 'Invalid'
                            }
                        },
                        end: {
                            idTagInfo: {
                                status: 'Invalid'
                            }
                        },
                    },
                };

                const response: BootNotificationResponse = {
                    status: 'Accepted',
                    currentTime: new Date().toISOString(),
                    interval: 30,
                };
                cb(response);
            });

            client.on('Heartbeat', async (request: HeartbeatRequest, cb: (response: HeartbeatResponse) => void) => {
                const response: HeartbeatResponse = {
                    currentTime: new Date().toISOString(),
                };

                if (client.getCpId()) {
                    const message = {
                        id: client.getCpId(),
                        charger: this.data.chargePoints[client.getCpId()].chargePoint,
                        lastActivity: response.currentTime,
                    };
                    await this.amqpConnection.publish('management.system', 'heartbeat.routing.key', message);
                    await this.updateLastSeen(client.getCpId());
                }
                cb(response);
            });

            client.on('Authorize', async (request: AuthorizeRequest, cb: (response: AuthorizeResponse) => void) => {
                this.logger.log(`Authorize request received from ${client.getCpId()}`);
                const chargePointData = this.data.chargePoints[client.getCpId()];
                if (!chargePointData) {
                    this.logger.error(`Charge point with ID ${client.getCpId()} not found`);
                    return;
                }
                chargePointData.transactions = {
                    authorization: {
                        idTagInfo: {
                            status: 'Accepted'
                        }
                    },
                    start: {
                        transactionId: 1,
                        idTagInfo: {
                            status: 'Invalid'
                        }
                    },
                    end: {
                        idTagInfo: {
                            status: 'Invalid'
                        }
                    },
                };
                this.logger.log(`Authorize request received from ${client.getCpId()} with idTag ${request.idTag}`);
                const response: AuthorizeResponse = chargePointData.transactions.authorization;
                this.logger.log(`Authorize response: ${JSON.stringify(response)}`);
                cb(response);
            });

            client.on('StartTransaction', async (request: StartTransactionRequest, cb: (response: StartTransactionResponse) => void) => {
                this.logger.log(`StartTransaction request received from ${client.getCpId()}`);
                const chargePointData = this.data.chargePoints[client.getCpId()];
                if (!chargePointData) {
                    this.logger.error(`Charge point with ID ${client.getCpId()} not found`);
                    return;
                }
                if (chargePointData.transactions.authorization.idTagInfo.status !== 'Accepted') {
                    this.logger.error(`StartTransaction request received from ${client.getCpId()} without authorization`);
                    const response: StartTransactionResponse = {
                        transactionId: 0,
                        idTagInfo: {
                            status: 'Invalid'
                        }
                    };
                    cb(response);
                }
                chargePointData.transactions.start.idTagInfo = {
                    status: 'Accepted'
                };

                const id = Math.floor(Math.random() * 255);
                chargePointData.transactions.start.transactionId = id;
                await this.updateTransactionStatus(client.getCpId(), id,request.connectorId, 'Accepted');
                const response: StartTransactionResponse = chargePointData.transactions.start;
                cb(response);
            });

            client.on('StopTransaction', async (request: StopTransactionRequest, cb: (response: StopTransactionResponse) => void) => {
                this.logger.log(`StopTransaction request received from ${client.getCpId()}`);
                const chargePointData = this.data.chargePoints[client.getCpId()];
                if (!chargePointData) {
                    this.logger.error(`Charge point with ID ${client.getCpId()} not found`);
                    return;
                }

                chargePointData.transactions.end.idTagInfo = {
                    status: 'Accepted'
                };

                await this.updateTransactionStatus(client.getCpId(), request.transactionId,0, 'Invalid');
                const response: StopTransactionResponse = chargePointData.transactions.end;
                cb(response);
            });
        });
    }

    async updateLastSeen(cpId: string): Promise<void> {
        const chargePoint = this.data.chargePoints[cpId].chargePoint;
        if (!chargePoint) {
            this.logger.error(`Charge point with ID ${cpId} not found`);
            return;
        }
    
        chargePoint.lastActivity = new Date()
        const result = await this.chargePointModel.updateOne({ _id: chargePoint._id }, { lastActivity: chargePoint.lastActivity });
    }

    async updateTransactionStatus(chargePointId: string, transactionId: number,connectorId: number, status: "Accepted" | "Blocked" | "Expired" | "Invalid" | "ConcurrentTx"): Promise<void> {
        const chargePointData = this.data.chargePoints[chargePointId];
        if (!chargePointData) {
            this.logger.error(`Charge point with ID ${chargePointId} not found`);
            return;
        }
        chargePointData.transactions.start.idTagInfo.status = status;
        this.logger.log(`Transaction ${transactionId} status updated to ${status}`);
        if (status === 'Accepted') {
            chargePointData.transactions.end.idTagInfo.status = 'Invalid';
            const message = {
                id: chargePointId,
                charger: this.data.chargePoints[chargePointId].chargePoint,
                lastActivity: 60,
            };
            await this.amqpConnection.publish('management.system', 'transaction.routing.key', message);
            this.logger.log(`Transaction ${transactionId} started`);
            this.chargePointModel.findOne({ _id: chargePointData.chargePoint._id }).then(chargePoint => {
                chargePoint.status = Status.Charging;
                chargePoint.connectors[connectorId].status = Status.Charging;
                this.logger.log(`status::: ${chargePoint}`);
                chargePoint.save();
            }).catch(err => {
                this.logger.error(`Error updating transaction status: ${err}`);
            });
        }
        else if (status === 'Invalid') {
            this.logger.log(`Transaction ${transactionId} ended`);
            this.chargePointModel.findOne({ _id: chargePointData.chargePoint._id }).then(chargePoint => {
                chargePoint.status = Status.Available;
                this.logger.log(`status::: ${chargePoint}`);
                chargePoint.save();
            }).catch(err => {
                this.logger.error(`Error updating transaction status: ${err}`);
            });
        }
    }

    async findBySerialNumber(serial_number: any): Promise<ChargePoint> {
        this.logger.log(`Finding charge point by serial number: ${serial_number}`);
        return this.chargePointModel.findOne({ serial_number: serial_number }).exec();
    }

    async registerChargePoint(body: CreateCPDto): Promise<ChargePoint> {
    
        const salt = randomBytes(8).toString('hex');
        const hash = (await scrypt(body.password, salt, 32)) as Buffer;
        const result = salt + '.' + hash.toString('hex');
        body.password = result;
        body.status = Status.Unavailable;
        this.logger.log('Body: ' + JSON.stringify(body));
    
        try {
            const connectors: Connector[] = body.connectors.map((connector) => ({
                type: connector.type,
                status: connector.status
            }));
            body.connectors = connectors;
            const createdChargePoint = new this.chargePointModel(body);
            return await createdChargePoint.save();
        } catch (error) {
            this.logger.error(`Error registering charge point: ${error}`);
            if (error instanceof MongoError && error.code === 11000) {
                throw new HttpException('Charge point with this serial number already exists', HttpStatus.CONFLICT);
            }
            throw error;
        }
    }
    

    async getAllChargePoints() {
        return this.chargePointModel.find().exec();
    }

    async getConnectorStatus(connectorId: string) {
        return this.chargePointModel.find({ connectors: { $elemMatch: { connectorId: connectorId } } }).exec();
    }
}
