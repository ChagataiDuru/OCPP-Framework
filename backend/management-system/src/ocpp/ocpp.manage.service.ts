import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';

@Injectable()
export class OcppService {

  private readonly logger = new Logger('OcppManager');

  @RabbitSubscribe({
    exchange: 'management.system',
    routingKey: 'heartbeat.routing.key',
    queue: 'heartbeat_queue',
  })
  public async handleHeartbeat(msg: {},amqpMsg: ConsumeMessage) {
    this.logger.log(`Correlation id: ${amqpMsg.properties.correlationId}`);
    this.logger.log(`Received heartbeat: ${JSON.stringify(msg)}`);
    
  }
}