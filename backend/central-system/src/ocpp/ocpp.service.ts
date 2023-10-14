import { Logger,Injectable } from '@nestjs/common';
import { BootNotificationRequest, BootNotificationResponse, HeartbeatRequest, HeartbeatResponse, OcppClientConnection, OcppServer,UnlockConnectorRequest,UnlockConnectorResponse } from 'ocpp-ts';
import { on } from 'events';

@Injectable()
export class OcppService {
    constructor(
        private readonly MyOcppServer: OcppServer
      ) {}
    
    private readonly logger = new Logger(OcppService.name);
    private readonly connectedChargePoints: OcppClientConnection[] = [];

    async EstablishServer() {
        this.MyOcppServer.listen(9210);
        console.log('Server1.6 listening on port 9210');
        console.log(this.MyOcppServer);
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

    async ChooseClient(clientId: string): Promise<OcppClientConnection> {
        const client = this.connectedChargePoints.find((client: OcppClientConnection) => client.getCpId() === clientId);
        if (!client) {
            throw new Error(`Client ${clientId} not found`);
        }
        return client;
    }

    async ListConnectedChargePoints(): Promise<number> {
        console.log('Connected charge points:');
        for (const client of this.connectedChargePoints) {
          console.log(`- ${client.getCpId()}`);
        }
        return this.connectedChargePoints.length;
    }

    async UnlockConnector(clientId: string): Promise<string>{
        const client = await this.ChooseClient(clientId)

        const payload: UnlockConnectorRequest = {
            connectorId: 1,
        };
        client.callRequest("UnlockConnector",payload).then((response: UnlockConnectorResponse) => {
            console.log(response);
            return response.status;
        }).catch((err) => {
            console.log(err);
        });
        return "error";
    }
}
