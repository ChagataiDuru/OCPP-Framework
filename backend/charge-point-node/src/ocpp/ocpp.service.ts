import { Logger,Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { BootNotificationRequest, BootNotificationResponse, HeartbeatRequest, HeartbeatResponse, OcppClientConnection, OcppServer,UnlockConnectorRequest,UnlockConnectorResponse } from 'ocpp-ts';
import { on } from 'events';

@Injectable()
export class OcppService implements OnApplicationBootstrap{
    constructor(
        private readonly MyOcppServer: OcppServer
      ) {}
    
    private readonly logger = new Logger(OcppService.name);
    private readonly connectedChargePoints: OcppClientConnection[] = [];

    async onApplicationBootstrap() {
        this.MyOcppServer.listen(9210);
        this.logger.log('Server1.6 listening on port 9210');
        
        this.MyOcppServer.on('connection', (client: OcppClientConnection) => {

            this.connectedChargePoints.push(client);

            this.logger.log(`Client ${client.getCpId()} connected`);

            client.on('close', (code: number, reason: Buffer) => {
                this.logger.log(`Client ${client.getCpId()} closed connection`, code, reason.toString());
            });
        
            client.on('BootNotification', (request: BootNotificationRequest, cb: (response: BootNotificationResponse) => void) => {
                const response: BootNotificationResponse = {
                    status: 'Accepted',
                    currentTime: new Date().toISOString(),
                    interval: 20,
                };
                cb(response);
            });
            client.on('Heartbeat', (request: HeartbeatRequest, cb: (response: HeartbeatResponse) => void) => {
                const response: HeartbeatResponse = {
                    currentTime: new Date().toISOString(),
                };
                this.logger.log(`Heartbeat from ${client.getCpId()}, at ${response.currentTime}`);
                cb(response);
            });
        });
    }

    updateTransactionStatus(chargePointId: string, transactionId: string, status: string) {
        throw new Error('Method not implemented.');
    }
}
