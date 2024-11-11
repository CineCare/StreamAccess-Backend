import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { NotFoundError } from 'rxjs';

export function handleErrorResponse(e, paramName: string, paramValue: string) {
  if (e instanceof NotFoundError || e.code === 'P2025') {
    throw new NotFoundException(`${paramName} ${paramValue}`);
  }
  if (e instanceof BadRequestException) {
    throw e;
  }
  if (e instanceof UnauthorizedException) {
    throw e;
  }
  // eslint-disable-next-line
  console.log(e);
  throw new BadRequestException();
}
