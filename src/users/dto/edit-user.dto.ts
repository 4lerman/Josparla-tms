import { IsOptional, IsString } from 'class-validator';

export class EditUserDto {
  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  username: string;
}
