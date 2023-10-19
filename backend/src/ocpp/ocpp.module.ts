import { Module } from '@nestjs/common';
import { OcppService as Ocpp2Server } from './ocpp.new.service';
import { OcppService as Ocpp1Server } from './ocpp.service';

import { OcppController } from './ocpp.controller';
import { OcppServer as OcppServer2 } from '@extrawest/node-ts-ocpp';
import { OcppServer as OcppServer1 } from 'ocpp-ts';

@Module({
  providers: [Ocpp1Server, Ocpp2Server, OcppServer2, OcppServer1],
  controllers: [OcppController]
})
export class OcppModule {}
