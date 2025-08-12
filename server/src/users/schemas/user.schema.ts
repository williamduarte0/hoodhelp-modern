import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: false })
  isAdmin: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    type: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String, required: true }
    },
    default: null,
    _id: false
  })
  location: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;

  @Prop({ type: [String], default: [] })
  interestCategories: string[];

  @Prop({ type: Number, default: null })
  desiredBudget: number | null;

  @Prop({ type: Number, default: 2, min: 1, max: 5 })
  locationRange: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
