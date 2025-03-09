import { BadRequestException, ParseIntPipe } from '@nestjs/common';

export class ParseQueryIdPipe extends ParseIntPipe {
  constructor(objectName: string) {
    super({
      exceptionFactory() {
        return new BadRequestException(`${objectName} id must be a number`);
      },
    });
  }
}
