import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendregistrationRequest(userName: string, email: string) {
    const adminMail = 'werquin.lucas@wanadoo.fr';

    await this.mailerService.sendMail({
      to: adminMail,
      subject: "Demande d'inscription StreamAccess",
      template: './registerRequest',
      context: {
        userName,
        email,
      },
    });
  }
}
