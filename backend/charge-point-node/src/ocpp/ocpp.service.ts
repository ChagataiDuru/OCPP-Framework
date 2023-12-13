import { Logger,Injectable, OnApplicationBootstrap, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { BootNotificationRequest, BootNotificationResponse, HeartbeatRequest, HeartbeatResponse, OcppClientConnection, OcppServer,UnlockConnectorRequest,UnlockConnectorResponse } from 'ocpp-ts';

import { Model } from 'mongoose';
import { MongoError } from 'mongodb';
import { randomBytes,scrypt as _scrypt } from "crypto";
import { promisify } from "util";

import { ChargePoint } from './schemas/charge.point.schemas';
import { CreateCPDto } from './dtos/create.cp.dto';

const scrypt = promisify(_scrypt);

@Injectable()
export class OcppService implements OnApplicationBootstrap{
    private chargePoints: { [cpId: string]: ChargePoint } = {};
    
    constructor(
        private readonly MyOcppServer: OcppServer,
        private readonly amqpConnection: AmqpConnection,
        @InjectModel(ChargePoint.name) private readonly chargePointModel: Model<ChargePoint>,
      ) {}
    
    private readonly logger = new Logger(OcppService.name);

    async onApplicationBootstrap() {
        this.MyOcppServer.listen(9210);
        this.logger.log('Server1.6 listening on port 9210');
        
        this.MyOcppServer.on('connection', (client: OcppClientConnection) => {
            this.logger.log(`Client ${client.getCpId()} connected`);

            client.on('close', (code: number, reason: Buffer) => {
                this.logger.log(`Client ${client.getCpId()} closed connection`, code, reason.toString());
            });
        
            client.on('BootNotification', async (request: BootNotificationRequest, cb: (response: BootNotificationResponse) => void) => {
                const serial_number = request.chargePointSerialNumber;
                const chargePoint = await this.findBySerialNumber(serial_number);
                if (!chargePoint) {
                    this.logger.error(`Charge point with serial number ${serial_number} not found`);
                    return;
                }
                this.chargePoints[client.getCpId()] = chargePoint;
            
                const response: BootNotificationResponse = {
                    status: 'Accepted',
                    currentTime: new Date().toISOString(),
                    interval: 20,
                };
                cb(response);
            });
            client.on('Heartbeat', async (request: HeartbeatRequest, cb: (response: HeartbeatResponse) => void) => {
                const response: HeartbeatResponse = {
                    currentTime: new Date().toISOString(),
                };

                if (client.getCpId()) {
                    const message = `Received heartbeat from charge point with ID: ${client.getCpId()} and serial number: ${this.chargePoints[client.getCpId()]} at ${new Date().toISOString()}`;
                    await this.amqpConnection.publish('management.system', 'heartbeat.routing.key', message);
                }
                
                this.logger.log(`Heartbeat queued from ${client.getCpId()}, at ${response.currentTime}`);
                cb(response);
            });
        });
    }

    updateTransactionStatus(chargePointId: string, transactionId: string, status: string) {
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
}
