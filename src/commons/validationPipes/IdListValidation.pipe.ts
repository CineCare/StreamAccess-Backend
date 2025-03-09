import { BadRequestException, ParseArrayPipe } from '@nestjs/common';

export const idListValidationPipe = new ParseArrayPipe({
  items: Number,
  exceptionFactory() {
    return new BadRequestException(
      'Invalid body : must be an array of numbers',
    );
  },
});
