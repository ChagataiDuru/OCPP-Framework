import { Module } from '@nestjs/common';
import { OcppService } from './ocpp.service';
import { OcppController } from './ocpp.controller';
import { OcppServer } from '@extrawest/node-ts-ocpp';

@Module({
  providers: [OcppService, OcppServer],
  controllers: [OcppController]
})
export class OcppModule {}
