import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
  export class ProductCreateDTO {
    @IsNotEmpty()
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