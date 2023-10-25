import { Module } from '@nestjs/common';
import { OcppController } from './ocpp.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMQService } from './rabbitmq.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'OCPP_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.OCPP_SERVICE_HOST || 'localhost',
          port: 4001,
        },  
      },
    ]),
  ],
  providers: [RabbitMQService],
  controllers: [OcppController]
})
export class OcppModule {}
