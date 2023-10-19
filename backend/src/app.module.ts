import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OcppModule } from './ocpp/ocpp.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [OcppModule,
    ClientsModule.register([
    {
      name: 'rabbit-mq-module',
      transport: Transport.RMQ,
      options: {
        urls: [
          'amqp://csms:csms@localhost:5672/',
        ],
        queue: 'rabbit-mq-nest-js',
      },
    },
  ]),
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}