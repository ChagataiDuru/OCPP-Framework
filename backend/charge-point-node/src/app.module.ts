import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { SessionModule } from 'nestjs-session';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OcppModule } from './ocpp/ocpp.module';

@Module({
  imports: 
  [
  OcppModule,
  ConfigModule.forRoot(),
  MongooseModule.forRoot(
    "mongodb://localhost:27017", 
    {
      dbName: process.env.DATABASE_NAME,
    }),
  SessionModule.forRoot({
      session: { secret: 'keyboard cat' },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}