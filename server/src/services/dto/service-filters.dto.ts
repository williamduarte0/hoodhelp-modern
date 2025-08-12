import { IsOptional, IsString, IsNumber, IsArray } from 'class-validator';

export class ServiceFiltersDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  category?: string[];

  @IsOptional()
  @IsNumber()
  minBudget?: number;

  @IsOptional()
  @IsNumber()
  maxBudget?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  search?: string;
}
