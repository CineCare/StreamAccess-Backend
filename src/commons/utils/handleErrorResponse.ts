import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { NotFoundError } from 'rxjs';

const HANDLE_CODE: Record<
  string,
  (e, paramName: string, paramValue: string | number) => Error
> = {
  P2025: (e, paramName, paramValue) =>
    new NotFoundException(`${paramName} ${paramValue}`),
  P2002: (e, paramName, paramValue) =>
    new BadRequestException(`${paramName} ${paramValue} already exists`), // Unique constraint violation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  P2003: (e, paramName, paramValue) =>
    new BadRequestException(
      `Wrong value for ${e.meta.field_name.substring(0, e.meta.field_name.length - 2)}`,
    ),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  P2000: (e, paramName, paramValue) =>
    new BadRequestException(`Value for ${e.meta.field_name} is too long`),
};

export function handleErrorResponse(
  e: any,
  paramName: string,
  paramValue: string | number,
) {
  // if (e instanceof NotFoundError || e.code === 'P2025') {
  //   throw new NotFoundException(`${paramName} ${paramValue}`);
  // }
  // if (e.code === 'P2002') {
  //   throw new BadRequestException(`${paramName} ${paramValue} existe déjà`); // Unique constraint violation
  // }
  // if (e.code === 'P2003') {
  //   throw new BadRequestException(
  //     `Wrong value for ${e.meta.field_name.substring(0, e.meta.field_name.length - 2)}`,
  //   );
  // }
  // if (e.code === 'P2000') {
  //   throw new BadRequestException(`Value for ${e.meta.field_name} is too long`);
  // }
  if (!!HANDLE_CODE[e.code]) {
    throw HANDLE_CODE[e.code](e, paramName, paramValue);
  }
  if (
    e instanceof BadRequestException ||
    e instanceof UnauthorizedException ||
    e instanceof NotFoundError
  ) {
    throw e;
  }
  // eslint-disable-next-line no-console
  console.log(e);
  throw new BadRequestException();
}
