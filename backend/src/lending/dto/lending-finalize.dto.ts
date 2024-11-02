import { IsString,  IsOptional } from 'class-validator';
  
  export class LendingFinalizeDTO {
    @IsOptional()
    @IsString()
    comments?: string;
  }