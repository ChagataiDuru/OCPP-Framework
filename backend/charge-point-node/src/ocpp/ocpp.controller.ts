import { Controller, Get, Render, Post, Body, Redirect } from '@nestjs/common';
import { OcppService as Ocpp2Server } from './ocpp.new.service';
import { ChargePoint } from './schemas/charge.point.schemas';

@Controller('register')
export class OcppController {
  constructor(private readonly ocpp2Service: Ocpp2Server) {}

  @Get()
  @Render('register')
  root() {
    return { message: 'Register the Charger!' };
  }

  @Post()
  @Redirect('/register')
  async register(@Body() body: any): Promise<ChargePoint> {
    return this.ocpp2Service.registerChargePoint(body);
  }

}