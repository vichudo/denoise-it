import en from "./en";
import es from "./es";

import type { Dictionary } from "./en";

export type { TranslationKey, Dictionary } from "./en";

const dictionaries: Record<string, Dictionary> = { en, es };

/** Locale codes that have a full UI translation */
export const UI_LOCALES = new Set(Object.keys(dictionaries));

/** Returns the dictionary for a locale, falling back to English */
export function getDictionary(locale: string): Dictionary {
  return dictionaries[locale] ?? en;
}

/** Number of analyzing phrases in the dictionaries */
export const ANALYZING_PHRASES_COUNT = 28;
