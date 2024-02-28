import { TokenType } from '@prisma/client';

export interface User {
  email: string;
  username: string;
}

export interface sendEmailI {
  user: User;
  type: TokenType;
  link: string;
}
