import { Controller, Get, Inject, Logger, NotFoundException, Param, Query, Res, UseGuards } from '@nestjs/common';
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
  
  @Get('/chargers/occupied')
  async getOccupiedChargePoints(): Promise<any[]> {
        this.logger.log(`Getting all occupied charge points`);
        const chargers = await this.ocppService.getOccupiedChargePoints();
        this.logger.log(`Found ${chargers.length} occupied charge points`);
        return chargers;
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

  @Get('/transactions')
  async getTransactions(): Promise<any[]> {
    this.logger.log(`Getting all transactions`);
    const transactions = await this.ocppService.getTransactions();
    this.logger.log(`Found ${transactions.length} transactions`);
    return transactions;
  }

  @Get('/heartbeat')
  sendHeartbeat(@Res() res: Response) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();
  
      if (!this.listener) {
        this.listenHeartbeat();
        this.listener = true;
      }

      res.end();
  }

  listenHeartbeat() {
    this.ocppService.heartbeatEvent.on('heartbeat', (msg) => {
      console.log('Received heartbeat: ', msg);
    });
  }

  @Get('/metervalue')
  sendMeterValue(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    if (!this.listener) {
      this.listenMeter();
      this.listener = true;
    }

    res.end();
  }

  listenMeter() {
    this.ocppService.meterValueEvent.on('charging', (msg) => {
      console.log('Received meter: ', msg);
    });
  }

  @Get('/meter')
  async getMeterValue(@Query('cpId') serial_number: string, @Query('connectorId') connectorId: number): Promise<any> {
      const charger = await this.ocppService.getChargePoint(serial_number);
      if (!charger) {
          throw new NotFoundException(`Charge point with serial number ${serial_number} not found`);
      }
      const connector = charger.connectors[connectorId];
      if (!connector || connector.status !== 'Charging') {
          throw new NotFoundException(`Connector with id ${connectorId} not found or not charging`);
      }
      return { currentMeterValue: connector.meterValue, startTimestamp: connector.startTimestamp};
  }

}
