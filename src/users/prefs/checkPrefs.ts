import { PrismaService } from 'src/prisma/prisma.service';
import { PrefDTO } from '../DTO/pref.dto';
import { prefEnums } from './prefEnums';

export const checkPrefs = async (
  prefs: PrefDTO[],
  prisma: PrismaService,
): Promise<{
  valid: { name: string; profileName: string }[];
  errors: string[];
}> => {
  const errors: string[] = [];
  const valid: { name: string; profileName: string }[] = [];
  for (const pref of prefs) {
    // check if pref is of type PrefDTO
    if (!pref.name || !pref.value || !pref.profileName) {
      errors.push(
        `some preferences are invalid. Required properties are name, value and profileName.`,
      );
      continue;
    }
    // check if pref has no duplicates
    const count: number = prefs.filter(
      (p) => p.name === pref.name && p.profileName === pref.profileName,
    ).length;
    if (count > 2) {
      errors.push(
        `Preference ${pref.name} for profile ${pref.profileName} is duplicated. It will be ignored.`,
      );
      continue;
    }
    // check if pref name and type are legit
    const existingPrefType = await prisma.prefType.findFirst({
      where: { prefName: pref.name },
    });
    if (!existingPrefType) {
      errors.push(`Preference ${pref.name} does not exist.`);
      continue;
    }
    if (
      existingPrefType.dataType !== 'enum' &&
      existingPrefType.dataType !== typeof pref.value
    ) {
      errors.push(
        `Preference ${pref.name} has type ${existingPrefType.dataType} but you provided ${typeof pref.value}.`,
      );
      continue;
    }
    if (existingPrefType.dataType === 'enum') {
      if (typeof pref.value !== 'string') {
        errors.push(
          `Preference ${pref.name} has type ${existingPrefType.dataType} but you provided ${typeof pref.value}.`,
        );
        continue;
      }
      if (!prefEnums[existingPrefType.prefName].includes(pref.value)) {
        errors.push(
          `Preference ${pref.name} has invalid value ${pref.value}. Allowed values are: ${prefEnums[
            existingPrefType.prefName
          ].join(', ')}`,
        );
        continue;
      }
    }
    valid.push({ name: pref.name, profileName: pref.profileName });
  }

  return { errors, valid };
};
