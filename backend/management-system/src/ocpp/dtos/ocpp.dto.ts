import { Expose } from "class-transformer";
import { ApiProperty } from '@nestjs/swagger';

export class OcppDto {

    @Expose()
    @ApiProperty()
    userId: number;

    @Expose()
    @ApiProperty()
    fullName: string;

    @Expose()
    @ApiProperty()
    bio: string;

    @Expose()
    @ApiProperty()
    email: string;

    isAdmin: boolean;

}