import { Module } from '@nestjs/common';
import { ModelDefinition, MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import mongoose from 'mongoose';

import { ChargePoint, ChargePointSchema } from './schemas/charge.point.schemas';
import { Transaction, TransactionSchema } from './schemas/transaction.schemas';
import { OcppController } from './ocpp.manage.controller';
import { OcppService } from './ocpp.manage.service';


@Module({
  imports: [
      MongooseModule.forFeatureAsync([
      {
        name: ChargePoint.name,
        inject: [getConnectionToken()],
        useFactory: (connection: mongoose.Connection): ModelDefinition['schema'] => {
          const schema = ChargePointSchema;
          return schema;
        }
      },
      {
        name: Transaction.name,
        inject: [getConnectionToken()],
        useFactory: (connection: mongoose.Connection): ModelDefinition['schema'] => {
          const schema = TransactionSchema;
          return schema;
        }
      }
    ]),
  ],
  providers: [OcppService],
  controllers: [OcppController]
})
export class OcppModule {}
