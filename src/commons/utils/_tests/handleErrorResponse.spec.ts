import { BadRequestException, UnauthorizedException } from '@nestjs/common';
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
});
