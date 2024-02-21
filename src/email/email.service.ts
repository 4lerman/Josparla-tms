import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from './entities/email-user.entity';
import { TokenType } from '@prisma/client';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendEmail(user: User, type: TokenType, link: string) {
    await this.mailerService.sendMail({
      to: user.email,
      from: '"Support Team" <support@example.com>', // override default from
      subject: `Josparla App! ${
        type === TokenType.RESET_PASSWORD
          ? 'Reset Password '
          : 'Activation link'
      }`,
      template:
        type === TokenType.RESET_PASSWORD
          ? './reset-password.ejs'
          : './activation-link.ejs',
      context: {
        // filling <%= %> brackets with content
        name: user.username,
        link,
      },
    });
  }
}
