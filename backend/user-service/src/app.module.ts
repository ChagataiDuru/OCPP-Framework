import { MiddlewareConsumer, Module } from '@nestjs/common';
import { RedisModule } from '@liaoliaots/nestjs-redis';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';

const cookieSession = require('cookie-session');

@Module({
  imports: [UserModule,
  MongooseModule.forRoot(
    process.env.DATABASE_URI, 
    {
      dbName: process.env.DATABASE_NAME,
    }),
  ],
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
