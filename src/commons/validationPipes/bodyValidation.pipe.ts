import { ValidationPipe } from '@nestjs/common/pipes';

export const bodyValidationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  skipMissingProperties: true,
});
