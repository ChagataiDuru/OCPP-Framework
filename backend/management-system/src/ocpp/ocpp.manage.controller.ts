import { Controller, Get, Inject, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { OcppDto } from './dtos/ocpp.dto';
import { AdminGuard } from 'src/guards/admin.guard';

@Controller('ocpp')
@Serialize(OcppDto)
export class OcppController {

}
