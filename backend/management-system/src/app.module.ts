import { MiddlewareConsumer, Module } from '@nestjs/common';
import {ClientsModule, Transport} from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TodosModule } from './todos/todos.module';
import { AppGateway } from './app.gateway';

const cookieSession = require('cookie-session');


@Module({
  imports: [UsersModule, TodosModule],
  controllers: [AppController],
  providers: [AppService,AppGateway],
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
