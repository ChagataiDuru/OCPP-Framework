import { BadRequestException, Body, Injectable, NotFoundException, Session, UnauthorizedException } from "@nestjs/common";
import { randomBytes,scrypt as _scrypt } from "crypto";
import { promisify } from "util";
import { plainToClass } from 'class-transformer';
import { CreateUserDto } from "./dtos/create-user.dto";

import { UserService } from "./user.service";
import { MessagePattern } from "@nestjs/microservices";

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
    constructor(private userService: UserService) {}

    async signUp(userDto: CreateUserDto) {
      console.log('UserDto:', userDto);
      const user = await this.userService.findOneByEmail(userDto.email);
      if(user){
          throw new BadRequestException('User with this email already exists');
      }
      const salt = randomBytes(8).toString('hex');
      const hash = (await scrypt(userDto.password, salt, 32)) as Buffer;
      const result = salt + '.' + hash.toString('hex');

      const userDtoInstance = plainToClass(CreateUserDto, {userDto, password: result});

      console.log('User to dto instance:', userDtoInstance);

      const newUser = await this.userService.create(userDtoInstance);
      return newUser;
    }
    
    async signin(email: string, password: string) {
        const user = await this.userService.findOneByEmail(email);
        if (!user) {
          throw new NotFoundException('user not found');
        }
    
        const [salt, storedHash] = user.password.split('.');
    
        const hash = (await scrypt(password, salt, 32)) as Buffer;
    
        if (storedHash !== hash.toString('hex')) {
          throw new BadRequestException('bad password');
        }

        return user;
    }
}