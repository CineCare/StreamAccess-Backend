import { PrismaService } from 'src/prisma/prisma.service';
import { PrefDTO } from '../DTO/pref.dto';
import { prefEnums } from './prefEnums';

export const checkPrefs = async (
  prefs: PrefDTO[],
  prisma: PrismaService,
): Promise<{ valid: string[]; errors: string[] }> => {
  const errors: string[] = [];
  const valid: string[] = [];
  for (const pref of prefs) {
    // check if pref is of type PrefDTO
    if (!pref.name || !pref.value) {
      errors.push(`some preferences are missing propertie name and/or value`);
      continue;
    }
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
    valid.push(pref.name);
  }
  

  return { errors, valid };
};
