
import { IsNumber, IsString, IsEnum, IsNotEmpty, IsOptional, IsLatitude, IsLongitude, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { ConnectorType } from '../schemas/charge.point.schemas';

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

export interface Connector {
  type: ConnectorType;
  status: Status;
}

export class CreateCPDto {

  @IsNumber()
  cpId: number;

  @IsString()
  description: string;

  @IsEnum(Status)
  status: string;

  @IsNotEmpty()
  @IsString()
  manufacturer: string;

  @IsOptional()
  @IsLatitude()
  latitude: number;

  @IsOptional()
  @IsLongitude()
  longitude: number;

  @IsNotEmpty()
  @IsString()
  serial_number: string;

  @IsOptional()
  @IsString()
  comment: string;

  @IsNotEmpty()
  @IsString()
  cpmodel: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsArray()
  connectors: Array<Connector>;
}