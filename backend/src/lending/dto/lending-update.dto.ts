import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, IsInt } from 'class-validator';
  
  export class LendingUpdateDTO {
    @IsOptional()
    @IsString()
    comments?: string;
  
    @IsNotEmpty()
    @IsNumber()
    BorrowerId: number;
  
    @IsOptional()
    @IsNumber()
    teacherId?: number;

    products: { productId: number; amount: number }[]; 
  }