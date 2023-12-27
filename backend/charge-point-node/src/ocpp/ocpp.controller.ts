import { Controller, Get, Render, Post, Body, Redirect, Res, Req, Session, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { OcppService as Ocpp2Server } from './ocpp.new.service';
import { OcppService } from './ocpp.service';
import { ChargePoint } from './schemas/charge.point.schemas';
import { Connector } from './dtos/create.cp.dto';

@Controller()
export class OcppController {
  constructor(private readonly ocpp2Service: Ocpp2Server,private readonly ocppService: OcppService) {}
  private readonly logger = new Logger('OcppController');

  @Get('/')
  async dashboard(@Res() res: any) {
    const chargers = await this.ocpp2Service.getAllChargePoints();
    this.logger.log(`Found ${chargers.length} charge points`);
    res.render('dashboard', { chargers });
  }


  @Get('register')
  @Render('register')
  root(@Req() req: Request, @Session() session: { successMessage?: string }) {
    let message = "Register your charge point";
    if (session && session.successMessage) {
      message = session.successMessage;
      delete session.successMessage;
    }
    return { message };
  }

  @Post('register')
  async register(@Res() res: any,@Body() body: any, @Session() session: { successMessage?: string }): Promise<void> {
    this.logger.log(`Registering charge point frontend: ${JSON.stringify(body)}`);
    try {
      let charger: any
     
      if (body.version == "1.6") {
        const connectors: Connector[] = body.connectors.type.map((type, index) => ({
            type,
            status: body.connectors.status[index]
        }));
        body.connectors = connectors;
        charger = await this.ocppService.registerChargePoint(body);
      }else{
        charger = await this.ocpp2Service.registerChargePoint(body);
      }
      this.logger.log(`Created charge point: ${JSON.stringify(charger)}`);
      session.successMessage = 'Registration successful';
      res.redirect('/register');
    } catch (error) {
        if (error instanceof HttpException) {
          if (error instanceof HttpException) {
            res.set('Refresh', `10; url=/register`);
            res.status(error.getStatus()).send(error.getResponse());
          } else {
            res.set('Refresh', `10; url=/register`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('An error occurred while registering the charge point');
          }
      }
    }
  }
}
