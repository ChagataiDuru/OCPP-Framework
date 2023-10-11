import { Module } from '@nestjs/common';
import { OcppController } from './ocpp.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

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
  controllers: [OcppController]
})
export class OcppModule {}
