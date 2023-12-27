import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum StopReason {
  Local = 'Local',
  PowerLoss = 'PowerLoss',
  Reboot = 'Reboot',
  Remote = 'Remote',
  SoftReset = 'SoftReset',
  EVDisconnected = 'EVDisconnected',
  DeAuthorized = 'DeAuthorized',
  Other = 'Other'
}

@Schema()
export class Transaction extends Document {
  @Prop({ required: true })
  connectorId: number;

  @Prop({ required: true })
  idTag: string;

  @Prop({ required: true })
  meterStart: number;

  @Prop({ required: true, type: Date })
  startTimestamp: Date;

  @Prop()
  transactionId: number;

  @Prop()
  meterStop: number;

  @Prop({ type: Date })
  stopTimestamp: Date;

  @Prop({ type: String, enum: Object.values(StopReason) })
  stopReason: StopReason;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);