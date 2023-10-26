import { Logger,Injectable, OnApplicationBootstrap, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AuthorizeRequest, AuthorizeResponse, BootNotificationRequest, BootNotificationResponse, HeartbeatRequest, HeartbeatResponse, OcppClientConnection, OcppServer,UnlockConnectorRequest,UnlockConnectorResponse } from '@extrawest/node-ts-ocpp';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

import { Model } from 'mongoose';
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

            client.on('Authorize', async (request: AuthorizeRequest, cb: (response: AuthorizeResponse) => void) => {

                this.logger.log(`Authorization request from ${client.getCpId()}, ID tag: ${request.idToken}`);

                const charger = await this.findBySerialNumber(request.idToken.additionalInfo[0].additionalIdToken);

                this.logger.log(`Charger: ${JSON.stringify(charger)}`);

                if (charger === null) {
                    const response: AuthorizeResponse = {
                        idTokenInfo: {
                            status: 'Invalid',
                            cacheExpiryDateTime: new Date().toISOString(),
                        },
                    };
                    cb(response);
                    return;
                }

                const [salt, storedHash] = charger.password.split('.');
                const hash = (await scrypt(request.idToken.idToken, salt, 32)) as Buffer;
        
                if (storedHash !== hash.toString('hex')) {
                    const response: AuthorizeResponse = {
                        idTokenInfo: {
                            status: 'Invalid',
                            cacheExpiryDateTime: new Date().toISOString(),
                        },
                    };
                    cb(response);
                    return;
                }

                const response: AuthorizeResponse = {
                idTokenInfo: {
                    status: 'Accepted',
                    cacheExpiryDateTime: new Date().toISOString(),
                  },
                };
        
                this.logger.log(`Authorization request from ${client.getCpId()}, ID tag: ${request.idToken}`);
                cb(response);
            });

            client.on('close', (code: number, reason: Buffer) => {
                this.logger.log(`Client ${client.getCpId()} closed connection`, code, reason.toString());
            });
        
            client.on('BootNotification', (request: BootNotificationRequest, cb: (response: BootNotificationResponse) => void) => {
                const response: BootNotificationResponse = {
                    status: 'Accepted',
                    currentTime: new Date().toISOString(),
                    interval: 10,
                };
                this.logger.log(`BootNotification from ${client.getCpId()}, at ${response.currentTime}, heartbeat interval ${response.interval}`);
                cb(response);
            });
            client.on('Heartbeat', async (request: HeartbeatRequest, cb: (response: HeartbeatResponse) => void) => {
                const response: HeartbeatResponse = {
                    currentTime: new Date().toISOString(),
                };
                if (client.getCpId()) {
                    this.logger.log(client);  
                    await this.amqpConnection.publish('management.system', 'heartbeat.routing.key', `Received heartbeat from: ${client.getCpId()} at ${new Date().toISOString()}`);
                }
                this.logger.log(`Heartbeat from ${client.getCpId()}, at ${response.currentTime}`);
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
        const createdChargePoint = new this.chargePointModel(body);

        this.logger.log(`Created charge point: ${JSON.stringify(createdChargePoint)}`);
        return createdChargePoint.save();
    }
}
