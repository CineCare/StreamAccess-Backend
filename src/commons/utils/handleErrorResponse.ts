import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { NotFoundError } from 'rxjs';

export function handleErrorResponse(
  e: any,
  paramName: string,
  paramValue: string | number,
) {
  if (e instanceof NotFoundError || e.code === 'P2025') {
    throw new NotFoundException(`${paramName} ${paramValue}`);
  }
  if (e.code === 'P2002') {
    throw new BadRequestException(`${paramName} ${paramValue} existe déjà`); // Unique constraint violation
  }
  if (e.code === 'P2003') {
    throw new BadRequestException(
      `Wrong value for ${e.meta.field_name.substring(0, e.meta.field_name.length - 2)}`,
    );
  }
  if (e.code === 'P2000') {
    throw new BadRequestException(`Value for ${e.meta.field_name} is too long`);
  }
  if (e instanceof BadRequestException || e instanceof UnauthorizedException) {
    throw e;
  }
  // eslint-disable-next-line no-console
  console.log(e);
  throw new BadRequestException();
}
