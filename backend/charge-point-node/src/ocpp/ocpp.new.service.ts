import { Logger,Injectable, OnApplicationBootstrap, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AuthorizeRequest, AuthorizeResponse, BootNotificationRequest, BootNotificationResponse, HeartbeatRequest, HeartbeatResponse, OcppClientConnection, OcppServer,TransactionEventRequest,TransactionEventResponse,UnlockConnectorRequest,UnlockConnectorResponse } from '@extrawest/node-ts-ocpp';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

import { Model } from 'mongoose';
import { MongoError } from 'mongodb';
import { randomBytes,scrypt as _scrypt } from "crypto";
import { promisify } from "util";

import { ChargePoint } from './schemas/charge.point.schemas';
import { CreateCPDto } from './dtos/create.cp.dto';

const scrypt = promisify(_scrypt);

@Injectable()
export class OcppService implements OnApplicationBootstrap{

    constructor(
        private readonly MyOcppServer: OcppServer,
        private readonly amqpConnection: AmqpConnection,
        @InjectModel(ChargePoint.name) private readonly chargePointModel: Model<ChargePoint>,
      ) {}
    
    private readonly logger = new Logger('OcppService2.0');
    private readonly connectedChargePoints: OcppClientConnection[] = [];

    async onApplicationBootstrap() {
        this.MyOcppServer.listen(9200);
        this.logger.log('Server2.0 listening on port 9200');

        this.MyOcppServer.on('connection', (client: OcppClientConnection) => {

            this.connectedChargePoints.push(client);

            this.logger.log(`Client ${client.getCpId()} connected`);

            client.on('BootNotification', (request: BootNotificationRequest, cb: (response: BootNotificationResponse) => void) => {
                const response: BootNotificationResponse = {
                    status: 'Accepted',
                    currentTime: new Date().toISOString(),
                    interval: 10,
                };
                this.logger.log(`BootNotification from ${client.getCpId()}, at ${response.currentTime}, heartbeat interval ${response.interval}`);
                cb(response);
            });

            client.on('close', (code: number, reason: Buffer) => {
                this.logger.log(`Client ${client.getCpId()} closed connection`, code, reason.toString());
            });

            client.on('Heartbeat', async (request: HeartbeatRequest, cb: (response: HeartbeatResponse) => void) => {
                const response: HeartbeatResponse = {
                    currentTime: new Date().toISOString(),
                };

                if (client.getCpId()) {
                    await this.amqpConnection.publish('management.system', 'heartbeat.routing.key', `Received heartbeat from: ${client.getCpId()} at ${new Date().toISOString()}`);
                }
                
                this.logger.log(`Heartbeat queued from ${client.getCpId()}, at ${response.currentTime}`);
                cb(response);
            });

            client.on('TransactionEvent', async (request: TransactionEventRequest, cb: (response: TransactionEventResponse) => void) => {
                
                this.logger.log(`TransactionEvent from ${client.getCpId()}, at ${new Date().toISOString()}, transactionId: ${request.transactionInfo.transactionId}`);
                const response: TransactionEventResponse = {
                    totalCost: 0,
                };
                switch (request.eventType) {
                    case 'Started':
                        this.logger.log(`Transaction started`);
                        const charger = await this.findBySerialNumber(client.getCpId());
                        //charger.status = 'occupied';
                        charger.save();
                        response.totalCost = 0;
                        break;
                    case 'Updated':
                        this.logger.log(`Transaction updated`);
                        break;
                    case 'Ended':
                        this.logger.log(`Transaction ended`);
                        break;
                    default:
                        this.logger.log(`Transaction unknown`);
                        break;
                }

                if (request.transactionInfo.chargingState === 'EVConnected') {
                    const charger = await this.findBySerialNumber(client.getCpId());
                    //charger.status = 'available';
                    charger.save();
                }

                cb(response);
            });

        });
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

}
