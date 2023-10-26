
import { IsNumber, IsString, IsEnum, IsNotEmpty, IsOptional, IsLatitude, IsLongitude, IsObject } from 'class-validator';

export class CreateCPDto {

  @IsNumber()
  cpId: number;

  @IsString()
  description: string;

  @IsEnum(['unavailable','available','occupied'])
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
  @IsObject()
  connectors: Record<string, any>;
}