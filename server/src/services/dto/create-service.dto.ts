import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateServiceDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  category: string[];

  @IsNotEmpty()
  @IsNumber()
  budget: number;

  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
