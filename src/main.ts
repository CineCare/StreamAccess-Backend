import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: { origin: true },
  });

  app.useStaticAssets(join(__dirname, '..', 'assets'), {
    prefix: '/assets/'
  });

  //swagger
  const config = new DocumentBuilder()
    .setTitle('cineHub')
    .setDescription('The accessStream API description')
    .setVersion('0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3100);
}
bootstrap();
