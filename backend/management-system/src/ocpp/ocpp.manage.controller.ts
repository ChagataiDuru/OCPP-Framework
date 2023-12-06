import { Controller, Get, Inject, Logger, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { OcppDto } from './dtos/ocpp.dto';
import { OcppService } from './ocpp.manage.service';

@Controller()
@Serialize(OcppDto)
export class OcppController {
    private readonly logger = new Logger('OcppManagerController');

    constructor(
        private readonly ocppService: OcppService,
    ) {}

    @Get('/chargers')
    async getAllChargePoints(): Promise<OcppDto[]> {
        this.logger.log(`Getting all charge points`);
        const chargers = await this.ocppService.getAllChargePoints();
        return chargers;
    }
}
