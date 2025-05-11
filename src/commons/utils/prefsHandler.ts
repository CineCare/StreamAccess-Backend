import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';

export class PrefDTO {
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  value: string | number | boolean;

  @ApiProperty()
  @IsNotEmpty()
  profileName: string;
}

export class PrefTypeDTO {
  @IsNotEmpty()
  @ApiProperty()
  prefName: string;

  @IsNotEmpty()
  @ApiProperty()
  dataType: string;
}

export const prefEnums = {
  theme: ['default', 'soft', 'lightTheme', 'highContrast', 'largeText'],
};

export const checkPrefs = async (
  prefs: PrefDTO[],
  prisma: PrismaService,
): Promise<{
  valid: { name: string; profileName: string }[];
  errors: string[];
}> => {
  const errors: string[] = [];
  const valid: { name: string; profileName: string }[] = [];
  //check for duplicates
  const duplicates = checkDuplicates(prefs);
  if (duplicates.errors.length > 0) {
    errors.push(duplicates.errors.join(', '));
    prefs = duplicates.prefs;
  }
  for (const pref of prefs) {
    // check if pref is of type PrefDTO
    if (!pref.name || !pref.value || !pref.profileName) {
      errors.push(
        `some preferences are invalid. Required properties are name, value and profileName.`,
      );
      continue;
    }
    if (await checkPrefType(pref, prisma)) {
      errors.push(await checkPrefType(pref, prisma));
      continue;
    }
    valid.push({ name: pref.name, profileName: pref.profileName });
  }

  return { errors, valid };
};

const checkDuplicates = (prefs: PrefDTO[]) => {
  const errors: string[] = [];
  for (const pref of prefs) {
    const count: number = prefs.filter(
      (p) => p.name === pref.name && p.profileName === pref.profileName,
    ).length;
    if (count > 1) {
      errors.push(
        `Preference ${pref.name} for profile ${pref.profileName} is duplicated. It will be ignored.`,
      );
      prefs = prefs.filter(
        (p) => p.name !== pref.name || p.profileName !== pref.profileName,
      );
    }
  }
  return { errors, prefs };
};

const checkPrefType = async (pref, prisma) => {
  let error: string = null;
  if (!pref.name || !pref.value || !pref.profileName) {
    error = `some preferences are invalid. Required properties are name, value and profileName.`;
    return error;
  }
  // check if pref name and type are legit
  const existingPrefType = await prisma.prefType.findFirst({
    where: { prefName: pref.name },
  });
  if (!existingPrefType) {
    error = `Preference ${pref.name} does not exist.`;
    return error;
  }
  if (
    existingPrefType.dataType !== 'enum' &&
    existingPrefType.dataType !== typeof pref.value
  ) {
    error = `Preference ${pref.name} has type ${existingPrefType.dataType} but you provided ${typeof pref.value}.`;
    return error;
  }
  if (existingPrefType.dataType === 'enum') {
    if (typeof pref.value !== 'string') {
      error = `Preference ${pref.name} has type ${existingPrefType.dataType} but you provided ${typeof pref.value}.`;
      return error;
    }
    if (!prefEnums[existingPrefType.prefName].includes(pref.value)) {
      error = `Preference ${pref.name} has invalid value ${pref.value}. Allowed values are: ${prefEnums[
        existingPrefType.prefName
      ].join(', ')}`;
      return error;
    }
  }
  return null;
};
