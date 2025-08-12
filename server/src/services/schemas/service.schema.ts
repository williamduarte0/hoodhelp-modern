import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ServiceDocument = Service & Document;

@Schema({ timestamps: true })
export class Service {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  requesterId: Types.ObjectId;

  @Prop({ required: true, type: [String] })
  category: string[];

  @Prop({ required: true })
  budget: number;

  @Prop({
    type: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String, required: true }
    },
    required: false,
    _id: false
  })
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };

  @Prop({ default: 'open' })
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  applicants: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  selectedApplicant: Types.ObjectId;

  @Prop({ default: false })
  isUrgent: boolean;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
