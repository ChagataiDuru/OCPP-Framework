import { Logger,Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { BootNotificationRequest, BootNotificationResponse, HeartbeatRequest, HeartbeatResponse, OcppClientConnection, OcppServer,UnlockConnectorRequest,UnlockConnectorResponse } from 'ocpp-ts';
import { Model } from 'mongoose';

import { ChargePoint } from './schemas/charge.point.schemas';

@Injectable()
export class OcppService implements OnApplicationBootstrap{
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
        
            client.on('BootNotification', (request: BootNotificationRequest, cb: (response: BootNotificationResponse) => void) => {
                const serial_number = request.chargePointSerialNumber;
                
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
                    // TODO: update message add charge point id
                    await this.amqpConnection.publish('management.system', 'heartbeat.routing.key', `Received heartbeat from: ${client.getCpId()} at ${new Date().toISOString()}`);
                }
                
                this.logger.log(`Heartbeat queued from ${client.getCpId()}, at ${response.currentTime}`);
                cb(response);
            });
        });
    }

    updateTransactionStatus(chargePointId: string, transactionId: string, status: string) {
        throw new Error('Method not implemented.');
    }
}
