import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export type User = any;

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) {}

    private readonly users = [
        {
          userId: 1,
          username: 'john',
          password: 'changeme',
        },
        {
          userId: 2,
          username: 'maria',
          password: 'guess',
        },
    ];

    async findOne(username: string): Promise<User | undefined> {
        return this.users.find(user => user.username === username);
    }

    async login(username: string, password: string): Promise<string> {
        const user = await this.validateUser(username, password);
        if (!user) {
            throw new HttpException('Invalid username or password', HttpStatus.BAD_REQUEST);
        }
        const payload = { username };
        return this.jwtService.sign(payload);
    }

    private async validateUser(username: string, password: string): Promise<User | undefined> {
        const user = await this.findOne(username);
        if (!user) {
            throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
        }
        if (user.password !== password) {
            throw new HttpException('Invalid password', HttpStatus.BAD_REQUEST);
        }
        return user;
    }
}