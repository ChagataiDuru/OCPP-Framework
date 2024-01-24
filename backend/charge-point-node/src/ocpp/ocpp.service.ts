import { Logger, Injectable, OnApplicationBootstrap, HttpException, HttpStatus } from '@nestjs/common';
import { BootNotificationRequest, BootNotificationResponse, HeartbeatRequest, HeartbeatResponse, OcppClientConnection, OcppServer, UnlockConnectorRequest, UnlockConnectorResponse, AuthorizeResponse, AuthorizeRequest, StartTransactionRequest, StartTransactionResponse, StopTransactionRequest, StopTransactionResponse, MeterValuesRequest, MeterValuesResponse, StatusNotificationRequest, StatusNotificationResponse, FirmwareStatusNotificationRequest, FirmwareStatusNotificationResponse } from 'ocpp-ts';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoError } from 'mongodb';

import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

import { ChargePoint } from './schemas/charge.point.schemas';
import { Transaction } from './schemas/transactions.schema';

import { CreateTransaction, StopReason } from './dtos/create.transaction.dto';
import { CreateCPDto,Status,Connector } from './dtos/create.cp.dto';
import { start } from 'repl';

const scrypt = promisify(_scrypt);

interface ConnectorStatus {
    status: Status;
    meterValues?: MeterValuesRequest;
  }
  
  interface Transactions {
    authorization: AuthorizeResponse;
    start: StartTransactionResponse;
    end: StopTransactionResponse;
  }
  
  interface ChargePointInfo {
    chargePoint: ChargePoint;
    connectorStatus: { [connectorId: number]: ConnectorStatus };
    transactions: Transactions;
  }
  
  interface ChargePointData {
    chargePoints: { [cpId: string]: ChargePointInfo };
  }

@Injectable()
export class OcppService implements OnApplicationBootstrap {
    private data: ChargePointData = {
        chargePoints: {},
    };
    private transaction: CreateTransaction = new this.transactionModel({
        connectorId: 0,
        idTag: '',
        meterStart: 0,
        startTimestamp: new Date(),
        transactionId: 0,
        meterStop: 0,
        stopTimestamp: new Date(),
        stopReason: StopReason.Other,
    });
    constructor(
        private readonly MyOcppServer: OcppServer,
        private readonly amqpConnection: AmqpConnection,
        @InjectModel(ChargePoint.name) private readonly chargePointModel: Model<ChargePoint>,
        @InjectModel(Transaction.name) private readonly transactionModel: Model<Transaction>,
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

            client.on('StatusNotification', async (request: StatusNotificationRequest, cb: (response: StatusNotificationResponse) => void) => {
                    this.logger.log(`StatusNotification request received from ${client.getCpId()}`);
                    const chargePointData = this.data.chargePoints[client.getCpId()];
                    if (!chargePointData) {
                        this.logger.error(`Charge point with ID ${client.getCpId()} not found`);
                        return;
                        }
                        const chargePoint = chargePointData.chargePoint;
                        const connectorId = request.connectorId;
                        const status = request.status;
                        await this.chargePointModel.updateOne({ _id: chargePoint._id }, { status: status });
                        this.logger.log(`StatusNotification request received from ${client.getCpId()} with status ${status}`);
                        const response: StatusNotificationResponse = {};
                        cb(response);
                });
            
            client.on('FirmwareStatusNotification', async (request: FirmwareStatusNotificationRequest, cb: (response: FirmwareStatusNotificationResponse) => void) => {
                this.logger.log(`FirmwareStatusNotification request received from ${client.getCpId()}`);
                const chargePointData = this.data.chargePoints[client.getCpId()];
                if (!chargePointData) {
                    this.logger.error(`Charge point with ID ${client.getCpId()} not found`);
                    return;
                }
                const chargePoint = chargePointData.chargePoint;
                const status = request.status;
                await this.chargePointModel.updateOne({ _id: chargePoint._id }, { status: status });
                this.logger.log(`FirmwareStatusNotification request received from ${client.getCpId()} with status ${status}`);
                const response: FirmwareStatusNotificationResponse = {};
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
                    return;
                }
                chargePointData.transactions.start.idTagInfo = {
                    status: 'Accepted'
                };

                const id = Math.floor(Math.random() * 255);
                chargePointData.transactions.start.transactionId = id;
                await this.updateTransactionStatus(client.getCpId(), id,request.connectorId, 'Accepted');
                const response: StartTransactionResponse = chargePointData.transactions.start;
                this.transaction.connectorId = request.connectorId;
                this.transaction.idTag = chargePointData.transactions.authorization.idTagInfo.status;
                this.transaction.meterStart = request.meterStart;
                this.transaction.startTimestamp = new Date();
                this.transaction.transactionId = id;
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
                this.transaction.meterStop = request.meterStop;
                this.transaction.stopTimestamp = new Date();
                this.transaction.stopReason = request.reason;
                this.logger.log(`StopTransaction request received from ${client.getCpId()} with transactionId ${request.transactionId} on connector ${this.transaction.connectorId}`);
                await this.updateTransactionStatus(client.getCpId(), request.transactionId , this.transaction.connectorId, 'Invalid');
                const response: StopTransactionResponse = chargePointData.transactions.end;
                cb(response);
            });

            client.on('MeterValues', async (request: MeterValuesRequest, cb: (response: MeterValuesResponse) => void) => {
                const chargePointData = this.data.chargePoints[client.getCpId()];

                if (!chargePointData) {
                    this.logger.error(`Charge point with ID ${client.getCpId()} not found`);
                    return;
                }

                chargePointData.connectorStatus[request.connectorId] = {
                    status: Status.Charging,
                    meterValues: request
                };

                this.logger.log(`MeterValues request received from ${client.getCpId()} with meterValue ${JSON.stringify(request.meterValue)}`);

                const chargePoint = await this.chargePointModel.findOne({ _id: chargePointData.chargePoint._id });
                this.logger.log(`Value: ${parseInt(request.meterValue[0].sampledValue[0].value)}`);
                chargePoint.connectors[request.connectorId].meterValue = parseInt(request.meterValue[0].sampledValue[0].value);
                chargePoint.markModified('connectors');
                chargePoint.save();
                this.logger.log('Saved: ', request.connectorId);
                const requestWithSerialNumber = {
                    ...request,
                    chargePointSerialNumber: chargePointData.chargePoint.serial_number,
                };
                await this.amqpConnection.publish('management.system', 'charging.routing.key', requestWithSerialNumber);
                const response: MeterValuesResponse = {};
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
                connectorId: connectorId,
                serial_number: chargePointData.chargePoint.serial_number,
                startTimestamp: new Date(),
                lastActivity: 60,
            };
            this.logger.log(`Transaction ${transactionId} started on ${chargePointId} in connector ${connectorId}`);
            this.chargePointModel.findOne({ _id: chargePointData.chargePoint._id }).then(chargePoint => {
                chargePoint.status = Status.Charging;
                chargePoint.connectors[connectorId].status = Status.Charging;
                chargePoint.connectors[connectorId].meterValue = this.transaction.meterStart;
                chargePoint.connectors[connectorId].startTimestamp = this.transaction.startTimestamp;
                chargePoint.markModified('connectors');
                this.logger.log(`status::: ${chargePoint.status}`);
                chargePoint.save();
            }).catch(err => {
                this.logger.error(`Error updating transaction status: ${err}`);
            });
            await this.amqpConnection.publish('management.system', 'transaction.routing.key', message);

        }
        else if (status === 'Invalid') {
            this.logger.log(`Transaction ${transactionId} ended for connector ${connectorId}`);
            this.chargePointModel.findOne({ _id: chargePointData.chargePoint._id }).then(chargePoint => {
                chargePoint.status = Status.Available;
                chargePoint.connectors[connectorId].status = Status.Available;
                chargePoint.connectors[connectorId].meterValue = 0;
                chargePoint.markModified('connectors');
                chargePoint.save();
            }).catch(err => {
                this.logger.error(`Error updating transaction status: ${err}`);
            });
            await this.transactionModel.create(this.transaction);
            this.transaction = this.newEmptyTransaction();
        }
    }

    async findBySerialNumber(serial_number: any): Promise<ChargePoint> {
        this.logger.log(`Finding charge point by serial number: ${serial_number}`);
        return await this.chargePointModel.findOne({ serial_number: serial_number }).exec();
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

    newEmptyTransaction(): CreateTransaction {
        return new this.transactionModel({
            connectorId: 0,
            idTag: '',
            meterStart: 0,
            startTimestamp: new Date(),
            transactionId: 0,
            meterStop: 0,
            stopTimestamp: new Date(),
            stopReason: StopReason.Other,
        });
    }
}
