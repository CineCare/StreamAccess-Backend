import { ParseQueryIdPipe } from '../parseQueryId.pipe';
import { BadRequestException } from '@nestjs/common';

describe('parseQueryValidationPipe', () => {
  it('should pass validation for a number string', async () => {
    const value = '1';
    const result = await new ParseQueryIdPipe('param').transform(value, {
      type: 'query',
    });
    expect(result).toEqual(parseInt(value));
  });

  it('should throw for a non number string', async () => {
    const value = 'wrong';
    await expect(
      new ParseQueryIdPipe('param').transform(value, {
        type: 'query',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
