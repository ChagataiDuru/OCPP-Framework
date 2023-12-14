import { IsDate } from "class-validator";

export class LastActivityDto {
    @IsDate()
    lastActivity: Date;
}