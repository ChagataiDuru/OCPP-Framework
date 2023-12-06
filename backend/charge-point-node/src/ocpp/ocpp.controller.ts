import { Controller, Get, Render, Post, Body, Redirect, Res, Req, Session } from '@nestjs/common';
import { OcppService as Ocpp2Server } from './ocpp.new.service';
import { ChargePoint } from './schemas/charge.point.schemas';

@Controller('register')
export class OcppController {
  constructor(private readonly ocpp2Service: Ocpp2Server) {}

  @Get()
  @Render('register')
  root(@Req() req: Request, @Session() session: { successMessage?: string }) {
    let message = "Register your charge point";
    if (session && session.successMessage) {
      message = session.successMessage;
      delete session.successMessage;
    }
    return { message };
  }

  @Post()
  @Redirect('/register')
  async register(@Body() body: any, @Session() session: { successMessage?: string }): Promise<void> {
    await this.ocpp2Service.registerChargePoint(body);
    session.successMessage = 'Registration successful';
  }
  
}
