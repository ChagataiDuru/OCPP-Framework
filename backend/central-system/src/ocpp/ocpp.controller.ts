import { Controller, Get, Post } from '@nestjs/common';
import { OcppService } from './ocpp.service';

@Controller('ocpp')
export class OcppController {
    constructor(private readonly ocppService: OcppService) {}

    @Get()
    async EstablishServer(): Promise<string> {
        const message = 'Hello OCPP!';
        this.ocppService.EstablishServer();
        return message;
    }

    @Get('list')
    async ListConnectedChargePoints(): Promise<string> {
        const message = 'Hello OCPP!';
        this.ocppService.ListConnectedChargePoints();
        return message;
    }

    @Post('unlock')
    async UnlockConnector(): Promise<string> {
        const message = 'Hello OCPP!';
        this.ocppService.UnlockConnector("CP_1");
        return message;
    }

}
