import { Module } from '@nestjs/common';
import { OcppService } from './ocpp.service';

@Module({
  providers: [OcppService]
})
export class OcppModule {}
