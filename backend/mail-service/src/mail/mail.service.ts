import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}


  async sendChargingStatus(chargerState: any, email: string) {

    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Nice App! Confirm your Email',
      template: './ChargerStatus', 
      context: { 
        state: chargerState,
      },
    });
  }
}
