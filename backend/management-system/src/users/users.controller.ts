import { Controller, Body, Post, Get, NotFoundException, Param, UseGuards, Session, Delete, Logger, Inject} from '@nestjs/common';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiOkResponse, } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto'; 
import { UserDto } from './dtos/user.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './user.schema';
import { AdminGuard } from 'src/guards/admin.guard';
import session from 'express-session';



@Controller('auth')
@Serialize(UserDto)
export class UsersController {
    logger = new Logger('Users-MicroService');
    constructor(
      @Inject('USER_SERVICE') private client: ClientProxy,
    ) {}
    
    @Get('/whoami')
    async whoAmI(@Session() session: any) {
      console.log(this.client)
      return session.user;
    }

    @Post('/signup')
    @ApiOkResponse({ type: CreateUserDto, description: 'Successfully created user' })
    @ApiBadRequestResponse({ description: 'User with that email already exists.' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async createUser(@Body() body: CreateUserDto, @Session() session: any) {
      try {
        const user = await new Promise<UserDto>((resolve, reject) => {
            this.client.send({ cmd: 'createUser' }, body).subscribe({
              next: (user: any) => {
                resolve(user);
              },
              error: (error: any) => {
                reject(error);
              },
            });
          });        
        console.log('Signed Up User:', user);
        session.user = user
        session.userId = user.userId;
        return user;
      }catch (error) {
        console.log('Error:', error);
        throw error;
      }
    }
  
    @Post('/signin')
    @ApiOkResponse({ type: LoginUserDto, description: 'Successfully logged in' })
    @ApiBadRequestResponse({ description: 'Bad credentials' })
    async signin(@Body() body: LoginUserDto, @Session() session: any) {
      const user = await new Promise<UserDto>((resolve, reject) => {
        this.client.send({ cmd: 'signin' }, body).subscribe({
          next: (user: UserDto) => {
            resolve(user);
          },
          error: (error: any) => {
            reject(error);
          },
        });
      });  
      session.user = user;
      session.userId = user.userId;
      session.isAdmin = user.isAdmin;

      return user;
    }

    @Post('/signout')
    signOut(@Session() session: any) {
      session.user = null;
      session.userId = null;
    }

    @Get('/users')
    async getAllUsers() {
        const user = await this.client.send({ cmd: 'getAllUsers' }, {});
        if (!user) {
            return new NotFoundException('No users found');
        }
        return user;
    }

    @Get('/users/:id')
    @UseGuards(AdminGuard)
    async getUser(@Param('id') id: string) {
        return await this.client.send({ cmd: 'getUserById' }, id);
    }

    @Delete('/users/:id')
    @UseGuards(AdminGuard)
    async deleteUser(@Param('id') id: string) {
        const user = await this.client.send({ cmd: 'getUserById' }, id);
        if (user) {
          return await this.client.send({ cmd: 'deleteUser' }, id);
        }
    }

}
