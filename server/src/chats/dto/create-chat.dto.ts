import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class CreateChatDto {
  @IsNotEmpty()
  @IsMongoId()
  serviceId: string;

  @IsNotEmpty()
  @IsMongoId()
  interestedUserId: string;
}
