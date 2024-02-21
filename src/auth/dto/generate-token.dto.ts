import { TokenType } from '../models/token.model';
import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateTokenDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  type: TokenType;
}
