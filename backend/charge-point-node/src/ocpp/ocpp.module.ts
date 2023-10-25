import { Module } from '@nestjs/common';
import { OcppService as Ocpp2Service } from './ocpp.new.service';
import { OcppService as Ocpp1Service } from './ocpp.service';

import { OcppController } from './ocpp.controller';
import { OcppServer as OcppServer2 } from '@extrawest/node-ts-ocpp';
import { OcppServer as OcppServer1 } from 'ocpp-ts';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'management.system',
          type: 'direct',
        },
      ],
      uri: 'amqp://csms:csms@localhost:5672',
    }),
  ],
  providers: [Ocpp1Service, Ocpp2Service, OcppServer2, OcppServer1],
  controllers: [OcppController]
})
export class OcppModule {}
