import { Body, Controller, Post, HttpCode, HttpStatus, ValidationPipe } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { AuthService } from './auth.service';

export class SignInDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body(new ValidationPipe()) signInDto: SignInDto): Promise<string> {
    const token = await this.authService.login(signInDto.username, signInDto.password);
    console.log('Login successful', token)
    return token;
  }
}

