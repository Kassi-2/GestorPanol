import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

  export class LendingUpdateDTO {
	@IsOptional()
	@IsString()
	comments?: string;

	@IsOptional()
	@IsNumber()
	teacherId?: number;

	@IsOptional()
	products?: { productId: number; amount: number }[];
  }