import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}


  async sendUserConfirmation(user: any, token: string) {

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to Nice App! Confirm your Email',
      template: './ChargerStatus', 
      context: { 
        name: user.name,
      },
    });
  }
}
