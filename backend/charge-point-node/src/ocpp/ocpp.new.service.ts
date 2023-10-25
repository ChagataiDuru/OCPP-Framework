import { Logger,Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { BootNotificationRequest, BootNotificationResponse, HeartbeatRequest, HeartbeatResponse, OcppClientConnection, OcppServer,UnlockConnectorRequest,UnlockConnectorResponse } from '@extrawest/node-ts-ocpp';
import { RabbitRPC, RabbitMQModule, AmqpConnection, Nack } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class OcppService implements OnApplicationBootstrap{
    constructor(
        private readonly MyOcppServer: OcppServer,
        private readonly amqpConnection: AmqpConnection
      ) {}
    
    private readonly logger = new Logger('OcppService2.0');
    private readonly connectedChargePoints: OcppClientConnection[] = [];

    async onApplicationBootstrap() {
        this.MyOcppServer.listen(9200);
        this.logger.log('Server2.0 listening on port 9200');

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
          this.logger.log(`- ${client.getCpId()}`);
        }
        return this.connectedChargePoints.length;
    }

    async UnlockConnector(clientId: string): Promise<string>{
        const client = await this.ChooseClient(clientId)

        const payload: UnlockConnectorRequest = {
            connectorId: 1,
            evseId: 1,
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
