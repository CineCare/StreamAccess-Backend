import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { handleErrorResponse } from '../handleErrorResponse';
describe('handleErrorResponse', () => {
  it('should return a BadRequestException', () => {
    const test = () =>
      handleErrorResponse(
        new BadRequestException(),
        'test param',
        'test value',
      );
    expect(test).toThrow(BadRequestException);
  });

  it('should return an UnauthorizedException', () => {
    const test = () =>
      handleErrorResponse(
        new UnauthorizedException(),
        'test param',
        'test value',
      );
    expect(test).toThrow(UnauthorizedException);
  });

  it('should return an Error', () => {
    const test = () =>
      handleErrorResponse(new Error(), 'test param', 'test value');
    expect(test).toThrow();
  });

  it('should return a NotFoundException for Prisma error P2025', () => {
    const test = () =>
      handleErrorResponse({ code: 'P2025' }, 'test param', 'test value');
    expect(test).toThrow(NotFoundException);
  });

  it('should return a BadRequestException for Prisma error P2002', () => {
    const test = () =>
      handleErrorResponse({ code: 'P2002' }, 'test param', 'test value');
    expect(test).toThrow(BadRequestException);
  });

  it('should return a BadRequestException for Prisma error P2003', () => {
    const test = () =>
      handleErrorResponse(
        { code: 'P2003', meta: { field_name: 'test_field' } },
        'test param',
        'test value',
      );
    expect(test).toThrow(BadRequestException);
  });

  it('should return a BadRequestException for Prisma error P2000', () => {
    const test = () =>
      handleErrorResponse(
        { code: 'P2000', meta: { field_name: 'test_field' } },
        'test param',
        'test value',
      );
    expect(test).toThrow(BadRequestException);
  });
});
