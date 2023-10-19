import { Controller, Get, Param, Post } from '@nestjs/common';
import { OcppService as Ocpp2Server } from './ocpp.new.service';
import { OcppService as Ocpp1Server } from './ocpp.service';

@Controller('ocpp')
export class OcppController {
    constructor(private readonly ocpp1Service: Ocpp1Server,private readonly ocpp2Service: Ocpp2Server) {}

    @Get()
    async EstablishServer(): Promise<string> {
        const message = 'Hello OCPP!';
        this.ocpp1Service.EstablishServer();
        this.ocpp2Service.EstablishServer();
        return message;
    }

    @Get('list')
    async ListConnectedChargePoints(): Promise<string> {
        const message = 'Hello OCPP!';
        this.ocpp1Service.ListConnectedChargePoints();
        this.ocpp2Service.ListConnectedChargePoints();
        return message;
    }

    @Post('unlock/:id')
    async UnlockConnector(@Param('id') id): Promise<string> {
        const message = 'Hello OCPP!';
        this.ocpp2Service.UnlockConnector(id);
        return message;
    }

}
