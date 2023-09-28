import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { RabbitMQClient } from './rabbit-mq/rabbit-mq.client';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly rabbitMQClient: RabbitMQClient) {}

  @Get()
  async getHello(): Promise<string> {
    const message = 'Hello RabbitMQ!';
    const response = await this.rabbitMQClient.sendMessage('rpc_queue', message);
    return response;
  }
}