import { Controller, Get, Inject, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { OcppDto } from './dtos/ocpp.dto';
import { AdminGuard } from 'src/guards/admin.guard';

@Controller('ocpp')
@Serialize(OcppDto)
export class OcppController {

}
