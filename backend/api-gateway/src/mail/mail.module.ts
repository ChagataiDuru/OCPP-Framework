import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.USER_SERVICE_HOST || 'localhost',
          port: 4002,
        },  
      },
    ]),
  ],
  controllers: [MailController]
})
export class MailModule {}
