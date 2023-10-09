import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailModule } from './mail/mail.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MailModule,
    MongooseModule.forRoot(
      process.env.DATABASE_URI, 
      {
        dbName: process.env.DATABASE_NAME,
      }),
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}