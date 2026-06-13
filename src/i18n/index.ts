import ar from "./ar.json";
import en from "./en.json";

export type Locale = "ar" | "en";
export type Dictionary = typeof ar;

const dictionaries: Record<Locale, Dictionary> = { ar, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.ar;
}

export function getStatusLabel(dict: Dictionary, status: string): string {
  return (dict.status as Record<string, string>)[status] ?? status;
}

export function getCategoryLabel(dict: Dictionary, category: string): string {
  return (dict.category as Record<string, string>)[category] ?? category;
}

export function getRoleLabel(dict: Dictionary, role: string): string {
  return (dict.roles as Record<string, string>)[role] ?? role;
}
