import { Controller, Get, Inject, Logger, NotFoundException, Param, Res, UseGuards } from '@nestjs/common';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { OcppService } from './ocpp.manage.service';
import { Response } from 'express';

@Controller()
export class OcppController {
    private readonly logger = new Logger('OcppManagerController');

    constructor(
        private readonly ocppService: OcppService,
    ) {}

    @Get('/chargers')
    async getAllChargePoints(): Promise<any[]> {
        this.logger.log(`Getting all charge points`);
        const chargers = await this.ocppService.getAllChargePoints();
        return chargers;
    }

    @Get('/heartbeat')
    sendHeartbeat(@Res() res: Response) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();
  
      this.ocppService.heartbeatEvent.on('heartbeat', (msg) => {
        res.write(`data: ${JSON.stringify(msg)}\n\n`);
      });
    }
}
