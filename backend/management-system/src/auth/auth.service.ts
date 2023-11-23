import { Injectable } from '@nestjs/common';
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
        const isValid = await this.validateUser(username, password);
        if (!isValid) {
            throw new Error('Invalid username or password');
        }
        const payload = { username };
        return this.jwtService.sign(payload);
    }

    private async validateUser(username: string, password: string): Promise<boolean> {
        const user = await this.findOne(username);
        return user && user.password === password;
    }
}
