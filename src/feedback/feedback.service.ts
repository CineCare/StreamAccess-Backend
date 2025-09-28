import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  async sendFeedbackMail(
    data: any,
    files?: {
      dessin?: Express.Multer.File[];
      audioFichier?: Express.Multer.File[];
    },
  ) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      const to = data.to || 'cinecare6@gmail.com';
      const subject = 'Nouveau feedback utilisateur StreamAccess';

      // Dictionnaire pour renommer les clés
      const keyLabels: Record<string, string> = {
        userName: 'Nom',
        userEmail: 'Email',
        message: 'Message',
        feedbackType: 'Type de retour',
        createdAt: "Date d'envoi",
        // Ajoutez ici d'autres correspondances si besoin
      };

      // Génère le HTML du tableau stylisé
      const formatDataAsTable = (obj: any): string => {
        let rows = '';
        for (const [key, value] of Object.entries(obj)) {
          const label = keyLabels[key] || key;
          rows += `<tr>
            <td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;background:#f7f7f7">${label}</td>
            <td style="padding:8px 12px;border:1px solid #ddd">${typeof value === 'object' && value !== null ? JSON.stringify(value, null, 2) : value}</td>
          </tr>`;
        }
        return `<table style="border-collapse:collapse;font-family:sans-serif;font-size:15px;min-width:350px;margin:10px 0">
          <tbody>${rows}</tbody>
        </table>`;
      };

      const html = `
        <div style="font-family:sans-serif">
          <h2 style="color:#007D7D">Nouveau feedback utilisateur StreamAccess</h2>
          ${formatDataAsTable(data)}
        </div>
      `;

      // Fallback texte brut simple
      const text = Object.entries(data)
        .map(
          ([key, value]) =>
            `${keyLabels[key] || key} : ${typeof value === 'object' && value !== null ? JSON.stringify(value, null, 2) : value}`,
        )
        .join('\n');

      // Ajoute les pièces jointes si présentes
      const attachments = [];
      if (files?.dessin?.[0]) {
        attachments.push({
          filename: files.dessin[0].originalname,
          content: files.dessin[0].buffer,
          contentType: files.dessin[0].mimetype,
        });
      }
      if (files?.audioFichier?.[0]) {
        attachments.push({
          filename: files.audioFichier[0].originalname,
          content: files.audioFichier[0].buffer,
          contentType: files.audioFichier[0].mimetype,
        });
      }

      const info = await transporter.sendMail({
        from: `"StreamAccess" <${process.env.MAIL_USER}>`,
        to,
        subject,
        text,
        html,
        attachments,
      });

      this.logger.log(`Email envoyé: ${info.messageId}`);
    } catch (error) {
      if (
        error?.code === 'EAUTH' &&
        String(error?.response || '').includes(
          'Username and Password not accepted',
        )
      ) {
        this.logger.error(
          "Erreur d'authentification Gmail : identifiants invalides ou mot de passe d'application manquant. " +
            "Vérifiez que vous utilisez un mot de passe d'application Google pour MAIL_PASS. " +
            'Voir https://support.google.com/mail/?p=BadCredentials',
        );
      } else {
        this.logger.error("Erreur lors de l'envoi du mail", error);
      }
      throw error;
    }
  }
}
