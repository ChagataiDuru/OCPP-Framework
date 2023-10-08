import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { AppService } from "./app.service";
import { UserModule } from './user/user.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "SERVICE_A",
        transport: Transport.TCP,
        options: {
          host: "127.0.0.1",
          port: 8888
        }
      }
    ]),
    UserModule,
    MailModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}