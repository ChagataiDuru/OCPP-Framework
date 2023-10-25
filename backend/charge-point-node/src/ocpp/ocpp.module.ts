import { Module } from '@nestjs/common';
import { OcppService as Ocpp2Server } from './ocpp.new.service';
import { OcppService as Ocpp1Server } from './ocpp.service';

import { OcppController } from './ocpp.controller';
import { OcppServer as OcppServer2 } from '@extrawest/node-ts-ocpp';
import { OcppServer as OcppServer1 } from 'ocpp-ts';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitmqService } from './rabbitmq.service';

@Module({
  imports: [
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
  providers: [Ocpp1Server, Ocpp2Server, OcppServer2, OcppServer1,RabbitmqService],
  controllers: [OcppController]
})
export class OcppModule {}
