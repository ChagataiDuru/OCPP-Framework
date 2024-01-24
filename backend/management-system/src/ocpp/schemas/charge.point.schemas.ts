import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum ConnectorType {
  ACType1 = 'AC Type1',
  ACType2 = 'AC Type2',
  ACGT = 'AC GB/T',
  DCCSS = 'DC CSS',
  DCCSS2 = 'DC CSS 2',
  CHAdeMO = 'CHAdeMO',
  DCGT = 'DC GB/T'
}

export enum Status {
  Available = 'Available',
  Preparing = 'Preparing',
  Charging = 'Charging',
  SuspendedEVSE = 'SuspendedEVSE',
  SuspendedEV = 'SuspendedEV',
  Finishing = 'Finishing',
  Reserved = 'Reserved',
  Unavailable = 'Unavailable',
  Faulted = 'Faulted'
}

@Schema()
class Connector {
  @Prop({ type: String, enum: Object.values(ConnectorType) })
  type: ConnectorType;

  @Prop({ type: String, enum: Object.values(Status) })
  status: Status;

  @Prop()
  meterValue: number;

  @Prop({ default: Date.now })
  startTimestamp: Date;
}

@Schema()
export class ChargePoint extends Document {

  @Prop()
  cpId: number;

  @Prop()
  description: string;

  @Prop({ type: String, enum: Object.values(Status), default: Status.Unavailable, index: true })
  status: Status;

  @Prop({ required: true })
  manufacturer: string;

  @Prop()
  latitude: number;

  @Prop()
  longitude: number;

  @Prop({ required: true, unique: true })
  serial_number: string;

  @Prop()
  comment: string;

  @Prop({ required: true })
  cpmodel: string;

  @Prop({ type: String, enum: ['1.6','2.0'], default: '1.6', index: true })
  ocppVersion: string;

  @Prop()
  password: string;

  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  connectors: Connector[];

  @Prop({ default: Date.now })
  lastActivity: Date;
}

export const ChargePointSchema = SchemaFactory.createForClass(ChargePoint);
