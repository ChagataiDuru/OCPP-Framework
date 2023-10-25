import { MiddlewareConsumer, Module } from '@nestjs/common';
import {ClientsModule, Transport} from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { OcppModule } from './ocpp/ocpp.manage.module';

const cookieSession = require('cookie-session');


@Module({
  imports: [UsersModule,OcppModule,    
    RabbitMQModule.forRoot(RabbitMQModule, {
    exchanges: [
      {
        name: 'management.system',
        type: 'direct',
      },
    ],
    uri: 'amqp://csms:csms@localhost:5672',
  }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          keys: ['asdfasfd'],
        }),
      )
      .forRoutes('*');    
  }
}
