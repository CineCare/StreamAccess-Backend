import { checkPrefs } from '../prefsHandler';
import { PrismaService } from '../../../prisma/prisma.service';

describe('prefsHandler', () => {
  const prismaMock = {
    prefType: {
      findFirst: jest.fn(),
    },
  };
  const prismaServiceMock = {
    prefType: prismaMock.prefType,
  } as unknown as PrismaService;

  it('should return no errors', async () => {
    const prefs = [
      {
        name: 'test',
        value: 'test',
        profileName: 'test',
      },
    ];
    prismaMock.prefType.findFirst.mockResolvedValue({
      name: 'test',
      dataType: 'string',
    });
    const test = await checkPrefs(prefs, prismaServiceMock);
    expect(test).toEqual({
      errors: [],
      valid: [{ name: 'test', profileName: 'test' }],
    });
  });

  it('should ignore invalid pref', async () => {
    const prefs = [
      {
        value: 'test',
        profileName: 'test',
      },
    ];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const test = await checkPrefs(prefs, prismaServiceMock);
    expect(test).toEqual({
      errors: [
        'some preferences are invalid. Required properties are name, value and profileName.',
      ],
      valid: [],
    });
  });

  it('should ignore wrong prefs', async () => {
    const prefs = [
      {
        name: 'wrong',
        value: 'test',
        profileName: 'test',
      },
    ];
    prismaMock.prefType.findFirst.mockResolvedValue(null);
    const test = await checkPrefs(prefs, prismaServiceMock);
    expect(test).toEqual({
      errors: ['Preference wrong does not exist.'],
      valid: [],
    });
  });

  it('should ignore duplicates', async () => {
    const prefs = [
      {
        name: 'test',
        value: 'test',
        profileName: 'test',
      },
      {
        name: 'test',
        value: 'test2',
        profileName: 'test',
      },
    ];
    const test = await checkPrefs(prefs, prismaServiceMock);
    expect(test).toEqual({
      errors: [
        `Preference test for profile test is duplicated. It will be ignored.`,
      ],
      valid: [],
    });
  });

  it('should ignore wrong pref type', async () => {
    const prefs = [
      {
        name: 'test',
        value: 2,
        profileName: 'test',
      },
    ];
    prismaMock.prefType.findFirst.mockResolvedValue({
      name: 'test',
      dataType: 'string',
    });
    const test = await checkPrefs(prefs, prismaServiceMock);
    expect(test).toEqual({
      errors: ['Preference test has type string but you provided number.'],
      valid: [],
    });
  });
});
