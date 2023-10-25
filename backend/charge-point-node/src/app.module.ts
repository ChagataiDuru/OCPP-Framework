import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OcppModule } from './ocpp/ocpp.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [OcppModule,
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'exchange_name',
          type: 'topic',
        },
      ],
      uri: 'amqp://csms:csms@localhost:5672',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}