import { IsEmail, IsOptional, IsString, MinLength, IsArray, IsNumber, ValidateNested, IsObject, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  address: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interestCategories?: string[];

  @IsOptional()
  @IsNumber()
  desiredBudget?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  locationRange?: number;
}
