import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { ModelDefinition, MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { AutoIncrementID, AutoIncrementIDOptions } from '@typegoose/auto-increment'
import mongoose from 'mongoose';


import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { User, UserSchema } from './user.schema';
import { CurrentUserMiddleware } from './middlewares/current-user.middleware';

@Module({
    imports: [
        MongooseModule.forFeatureAsync([
            {
              name: User.name,
              inject: [getConnectionToken()],
              useFactory: (connection: mongoose.Connection): ModelDefinition['schema'] => {
                const schema = UserSchema
                schema.plugin(AutoIncrementID, { field: 'userId' } as AutoIncrementIDOptions)
                return schema
              }
            }
          ]),
    ],
    controllers: [UserController],
    exports: [UserService],
    providers: [UserService, AuthService],
})
export class UserModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(CurrentUserMiddleware).forRoutes('*');
    }
}
