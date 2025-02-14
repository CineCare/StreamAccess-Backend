import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { NotFoundError } from 'rxjs';

export function handleErrorResponse(
  e: any,
  paramName: string,
  paramValue: string,
) {
  if (e instanceof NotFoundError || e.code === 'P2025') {
    throw new NotFoundException(`${paramName} ${paramValue}`);
  }
  if (e.code === 'P2002') {
    throw new BadRequestException(`${paramName} ${paramValue} existe déjà`); // Unique constraint violation
  }
  if (e instanceof BadRequestException || e instanceof UnauthorizedException) {
    throw e;
  }
  // eslint-disable-next-line
  console.log(e);
  throw new BadRequestException();
}
