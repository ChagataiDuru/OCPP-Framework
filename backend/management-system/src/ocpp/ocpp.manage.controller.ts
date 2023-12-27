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
   listener = false;

  @Get('/chargers')
  async getAllChargePoints(): Promise<any[]> {
        this.logger.log(`Getting all charge points`);
        const chargers = await this.ocppService.getAllChargePoints();

        return chargers;
    }

  @Get('/chargers/available')
  async getAvailableChargePoints(): Promise<any[]> {
        this.logger.log(`Getting all available charge points`);
        const chargers = await this.ocppService.getAvailableChargePoints();
        const occupiedChargers = await this.ocppService.getOccupiedChargePoints();
        const totalChargers = chargers.concat(occupiedChargers);
        this.logger.log(`Found ${totalChargers.length} available charge points`);
        return totalChargers;
    }

  @Get('/chargers/:id')
  async getChargePoint(@Param('id') id: string): Promise<any> {
    this.logger.log(`Getting charge point with serial number ${id}`);
    const charger = await this.ocppService.getChargePoint(id);
    this.logger.log('Charger connectors: ', charger.connectors);
    if (!charger) {
        throw new NotFoundException(`Charge point with serial number ${id} not found`);
    }
    return charger;
  }

  @Get('/heartbeat')
  sendHeartbeat(@Res() res: Response) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();
  
      if (!this.listener) {
        this.listen();
        this.listener = true;
      }

      res.end();
  }

  listen() {
    this.ocppService.heartbeatEvent.on('heartbeat', (msg) => {
      console.log('Received heartbeat: ', msg);
    });
  }

}
