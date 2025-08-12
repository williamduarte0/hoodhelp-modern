import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema({ timestamps: true })
export class Chat {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  serviceOwnerId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  interestedUserId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Service' })
  serviceId: Types.ObjectId;

  @Prop([{
    message: { type: String, required: true },
    senderId: { type: Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now }
  }])
  messages: Array<{
    message: string;
    senderId: Types.ObjectId;
    timestamp: Date;
  }> | string[];

  @Prop({ required: true, enum: ['active', 'closed', 'archived'], default: 'active' })
  status: 'active' | 'closed' | 'archived';

  @Prop({ default: Date.now })
  lastMessageAt: Date;

  @Prop({ default: '' })
  lastMessage: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

ChatSchema.index({ serviceOwnerId: 1, serviceId: 1 });
ChatSchema.index({ interestedUserId: 1, serviceId: 1 });
ChatSchema.index({ serviceId: 1 });
ChatSchema.index({ lastMessageAt: -1 });

