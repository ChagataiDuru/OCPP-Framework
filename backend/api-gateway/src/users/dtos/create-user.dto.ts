import { ApiProperty, OmitType } from '@nestjs/swagger'
import { IsEmail, IsString } from 'class-validator'

export class CreateUserDto {
  @IsString()
  @ApiProperty()
  fullName: string

  @IsEmail()
  @ApiProperty()
  email: string

  @IsString()
  @ApiProperty()
  bio: string

  @IsString()
  @ApiProperty()
  password: string
}

export class UpdateUserInput extends OmitType(CreateUserDto, [
  'password'
] as const) {}