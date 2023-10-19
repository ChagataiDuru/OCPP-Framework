import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { RabbitmqService } from './ocpp/rabbitmq.service';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly rabbitMQService: RabbitmqService,
  ) {}
  @Get()
  async getHello() {
    this.rabbitMQService.send('rabbit-mq-producer', {
      message: this.appService.getHello(),
    });
    return 'Message sent to the queue!';
  }
}