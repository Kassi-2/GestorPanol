import { IsNotEmpty, IsString, IsBoolean, IsDate } from 'class-validator';

export class AlertCreateDTO {
  @IsNotEmpty()
  @IsDate()
  date: Date;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsBoolean()
  state: boolean;
}
