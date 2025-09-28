import {
  Body,
  Controller,
  Post,
  HttpException,
  HttpStatus,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('send-feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'dessin', maxCount: 1 },
      { name: 'audioFichier', maxCount: 1 },
    ]),
  )
  async sendFeedback(
    @Body() body: any,
    @UploadedFiles()
    files: {
      dessin?: Express.Multer.File[];
      audioFichier?: Express.Multer.File[];
    },
  ) {
    try {
      await this.feedbackService.sendFeedbackMail(body, files);
      return { message: 'Feedback envoyé avec succès' };
    } catch {
      throw new HttpException(
        "Erreur lors de l'envoi du mail",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
