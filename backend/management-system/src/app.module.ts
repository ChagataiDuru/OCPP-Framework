import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import {ClientsModule, Transport} from '@nestjs/microservices';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { OcppModule } from './ocpp/ocpp.manage.module';

const cookieSession = require('cookie-session');


@Module({
  imports: [UsersModule,OcppModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      "mongodb://localhost:27017", 
      {
        dbName: process.env.DATABASE_NAME,
      }),    
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
