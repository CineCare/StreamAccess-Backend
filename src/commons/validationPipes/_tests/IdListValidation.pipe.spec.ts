import { idListValidationPipe } from '../IdListValidation.pipe';
import { BadRequestException } from '@nestjs/common';

describe('idListValidationPipe', () => {
  it('should pass validation for an array of numbers', async () => {
    const value = [1, 2, 3];
    const result = await idListValidationPipe.transform(value, {
      type: 'body',
    });
    expect(result).toEqual(value);
  });

  it('should throw BadRequestException for an array with non-number elements', async () => {
    const value = [1, 'two', 3];
    await expect(
      idListValidationPipe.transform(value, { type: 'body' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException for a non-array value', async () => {
    const value = 'not an array';
    await expect(
      idListValidationPipe.transform(value, { type: 'body' }),
    ).rejects.toThrow(BadRequestException);
  });
});
