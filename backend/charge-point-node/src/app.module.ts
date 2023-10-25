import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OcppModule } from './ocpp/ocpp.module';

@Module({
  imports: [OcppModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}