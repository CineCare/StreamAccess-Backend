import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendRegistrationRequest(userName: string, email: string) {
    await this.mailerService.sendMail({
      to: process.env.ADMIN_EMAIL,
      subject: "Demande d'inscription StreamAccess",
      template: './registerRequest',
      context: {
        userName,
        email,
      },
    });
  }

  async sendAccountValidation(userName: string, email: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Validation de votre compte StreamAccess',
      template: './accountValidation',
      context: {
        userName,
      },
    });
  }

  async sendAccountRejection(userName: string, email: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: "Votre demande d'inscription n'a pas été retenue",
      template: './accountRejection',
      context: {
        userName,
      },
    });
  }
}
