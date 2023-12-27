import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
var bodyParser = require('body-parser')

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');
  await app.listen(4001);
}
bootstrap();
