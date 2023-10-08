import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, ObjectId } from 'mongoose'

export type UserDocument = HydratedDocument<User>

@Schema({ collection: 'users', timestamps: true })
export class User {
  @Prop()
  userId: number
  
  @Prop()
  fullName: string

  @Prop()
  email: string

  @Prop()
  bio: string

  @Prop()
  password: string

  @Prop()
  isAdmin: boolean

  @Prop()
  notifications: number[]

}

export const UserSchema = SchemaFactory.createForClass(User)