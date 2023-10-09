import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
const logger = new Logger('UserService');

const microserviceOptions = {
  transport: Transport.TCP,
  options: {
    host: '0.0.0.0',
    port: 4003,
  },
};

async function bootstrap() {
  const app = await NestFactory.createMicroservice(
    AppModule,
    microserviceOptions,
  )  
  app.useLogger(logger)
  await app.listen().then(() => {
    logger.log('Mail microservice is listening ... ');
  });
}
bootstrap();