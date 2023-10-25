import { MiddlewareConsumer, Module } from '@nestjs/common';
import {ClientsModule, Transport} from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

const cookieSession = require('cookie-session');


@Module({
  imports: [UsersModule,    
    RabbitMQModule.forRoot(RabbitMQModule, {
    exchanges: [
      {
        name: 'exchange_name',
        type: 'topic',
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
