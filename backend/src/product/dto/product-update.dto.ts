import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class ProductUpdateDTO {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  stock: number;

  @IsOptional()
  @IsNumber()
  criticalStock: number;

  @IsOptional()
  @IsBoolean()
  fungible: boolean;

}