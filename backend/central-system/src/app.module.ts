import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitMQModule } from './rabbit-mq/rabbit-mq.module';
import { OcppModule } from './ocpp/ocpp.module';

@Module({
  imports: [RabbitMQModule, OcppModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}