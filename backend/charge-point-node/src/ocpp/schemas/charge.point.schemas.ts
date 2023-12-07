import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ChargePoint extends Document {

  @Prop()
  cpId: number;

  @Prop()
  description: string;

  @Prop({ type: String, enum: ['unavailable','available','occupied'], default: 'unavailable', index: true })
  status: string;

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

  @Prop({ type: Map, default: {} })
  connectors: Record<string, any>;
}

export const ChargePointSchema = SchemaFactory.createForClass(ChargePoint);
