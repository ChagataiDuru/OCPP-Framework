import { Logger, Injectable, OnApplicationBootstrap, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { BootNotificationRequest, BootNotificationResponse, HeartbeatRequest, HeartbeatResponse, OcppClientConnection, OcppServer, UnlockConnectorRequest, UnlockConnectorResponse, AuthorizeResponse, AuthorizeRequest, StartTransactionRequest, StartTransactionResponse, StopTransactionRequest, StopTransactionResponse } from 'ocpp-ts';
import { Model } from 'mongoose';
import { MongoError } from 'mongodb';
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";
import { ChargePoint } from './schemas/charge.point.schemas';
import { CreateCPDto } from './dtos/create.cp.dto';

const scrypt = promisify(_scrypt);

interface ChargePointData {
    chargePoints: { [cpId: string]: {
        chargePoint: ChargePoint;
        connectorStatus: { [connectorId: string]: string };
        transactions: { [transactionId: number]: {
            authorization: AuthorizeResponse,
            start: StartTransactionResponse,
            end: StopTransactionResponse
        } };
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
                await this.chargePointModel.updateOne({ _id: chargePoint._id }, { status: 'unavailable' });
                this.data.chargePoints[client.getCpId()] = undefined;
            });

            client.on('BootNotification', async (request: BootNotificationRequest, cb: (response: BootNotificationResponse) => void) => {
                const serial_number = request.chargePointSerialNumber;
                const chargePoint = await this.findBySerialNumber(serial_number);
                if (!chargePoint) {
                    this.logger.error(`Charge point with serial number ${serial_number} not found`);
                    return;
                }
                await this.chargePointModel.updateOne({ _id: chargePoint._id }, { status: 'available' });

                this.data.chargePoints[client.getCpId()] = {
                    chargePoint: chargePoint,
                    connectorStatus: {},
                    transactions: {},
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

                this.logger.log(`Heartbeat queued from ${client.getCpId()}, at ${response.currentTime}`);
                cb(response);
            });

            client.on('Authorize', async (request: AuthorizeRequest, cb: (response: AuthorizeResponse) => void) => {
                this.logger.log(`Authorize request received from ${client.getCpId()}`);
                const chargePointData = this.data.chargePoints[client.getCpId()];
                if (!chargePointData) {
                    this.logger.error(`Charge point with ID ${client.getCpId()} not found`);
                    return;
                }
                const id = Math.floor(Math.random() * 255);
                chargePointData.transactions[id] = {
                    authorization: {
                        idTagInfo: {
                            status: 'Accepted'
                        }
                    },
                    start: {
                        transactionId: id,
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

                const response: AuthorizeResponse = chargePointData.transactions[id].authorization;
                cb(response);
            });

            client.on('StartTransaction', async (request: StartTransactionRequest, cb: (response: StartTransactionResponse) => void) => {
                this.logger.log(`StartTransaction request received from ${client.getCpId()}`);
                const chargePointData = this.data.chargePoints[client.getCpId()];
                if (!chargePointData) {
                    this.logger.error(`Charge point with ID ${client.getCpId()} not found`);
                    return;
                }

                const id = Math.floor(Math.random() * 255);
                chargePointData.transactions[id].start = {
                    transactionId: id,
                    idTagInfo: {
                        status: 'Accepted'
                    }
                };

                const response: StartTransactionResponse = chargePointData.transactions[id].start;
                cb(response);
            });

            client.on('StopTransaction', async (request: StopTransactionRequest, cb: (response: StopTransactionResponse) => void) => {
                this.logger.log(`StopTransaction request received from ${client.getCpId()}`);
                const chargePointData = this.data.chargePoints[client.getCpId()];
                if (!chargePointData) {
                    this.logger.error(`Charge point with ID ${client.getCpId()} not found`);
                    return;
                }

                const id = Math.floor(Math.random() * 255);
                chargePointData.transactions[id].end = {
                    idTagInfo: {
                        status: 'Accepted'
                    }
                };

                const response: StopTransactionResponse = chargePointData.transactions[id].end;
                cb(response);
            });
        });
    }

    async updateLastSeen(cpId: string): Promise<void> {
        const chargePoint = this.data.chargePoints[cpId].chargePoint;
        this.logger.log(`Updating last seen for charge point ${cpId}`);
        if (!chargePoint) {
            this.logger.error(`Charge point with ID ${cpId} not found`);
            return;
        }
    
        chargePoint.lastActivity = new Date()
        const result = await this.chargePointModel.updateOne({ _id: chargePoint._id }, { lastActivity: chargePoint.lastActivity });
    }

    updateTransactionStatus(chargePointId: string, transactionId: string, status: string) {
        // Implement your logic here
        throw new Error('Method not implemented.');
    }

    async findBySerialNumber(serial_number: any): Promise<ChargePoint> {
        this.logger.log(`Finding charge point by serial number: ${serial_number}`);
        return this.chargePointModel.findOne({ serial_number: serial_number }).exec();
    }

    async registerChargePoint(body: CreateCPDto): Promise<ChargePoint> {
        this.logger.log(`Registering charge point: ${JSON.stringify(body)}`);

        const salt = randomBytes(8).toString('hex');
        const hash = (await scrypt(body.password, salt, 32)) as Buffer;
        const result = salt + '.' + hash.toString('hex');
        body.password = result;
        body.status = 'unavailable';
        const createdChargePoint = new this.chargePointModel(body);

        try {
            return await createdChargePoint.save();
        } catch (error) {
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
        // Implement your logic here
        throw new Error('Method not implemented.');
    }
}
