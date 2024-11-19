import { UserType } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UserCreateDTO {
  @IsNotEmpty()
  @IsString()
  rut: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  @IsString()
  mail: string;

  @IsOptional()
  @IsNumber()
  phoneNumber: number;

  @IsNotEmpty()
  @IsString()
  @IsEnum(UserType)
  type: UserType;

  @IsOptional()
  @IsString()
  degree: string;

  @IsOptional()
  @IsString()
  role: string;
}
