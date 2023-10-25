import { Module } from '@nestjs/common';
import { OcppController } from './ocpp.manage.controller';
import { OcppService } from './ocpp.manage.service';


@Module({
  imports: [],
  providers: [OcppService],
  controllers: [OcppController]
})
export class OcppModule {}
