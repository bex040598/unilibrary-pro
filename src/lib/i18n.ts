import en from "@/i18n/translations/en";
import ru from "@/i18n/translations/ru";
import uz from "@/i18n/translations/uz";
import { Language, UserRole } from "@/types";

export const translations = { uz, ru, en };

export type TranslationKey = keyof typeof uz;

export function t(language: Language, key: TranslationKey) {
  return translations[language][key] ?? translations.uz[key];
}

export function roleLabel(role: UserRole) {
  return {
    guest: "Guest",
    student: "Student",
    teacher: "Teacher",
    librarian: "Librarian",
    cataloger: "Cataloger",
    acquisitionManager: "Acquisition Manager",
    repositoryManager: "Repository Manager",
    admin: "Admin",
    superAdmin: "Super Admin"
  }[role];
}
