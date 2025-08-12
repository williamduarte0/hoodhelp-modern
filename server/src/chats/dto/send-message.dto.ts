import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty()
  @IsMongoId()
  chatId: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}
