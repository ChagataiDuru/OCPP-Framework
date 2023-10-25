import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RabbitMQService {
  constructor() {}

  @RabbitSubscribe({exchange: 'exchange_name',routingKey: 'routing.key',queue: 'queue_name',})
    public async handleMessage(message: string) {
        console.log(`Received message: ${message}`);
    }
}