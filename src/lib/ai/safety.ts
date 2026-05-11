export const AI_LIBRARY_FALLBACK =
  "Bu savol bo'yicha kutubxona fondida yetarli ma'lumot topilmadi.";

export const AI_LIBRARY_DISCLAIMER =
  "AI yordamchisi kutubxona fondi va elektron resurslar asosida tavsiya beradi. Javoblar ilmiy ishda ishlatishdan oldin foydalanuvchi tomonidan tekshirilishi kerak.";

export const AI_ADVISORY_NOTE =
  "AI tavsiyalari yordamchi xarakterga ega. Yakuniy ilmiy xulosa foydalanuvchi tomonidan tekshirilishi kerak.";

export function sanitizePrompt(input: string) {
  return input.trim().replace(/\s+/g, " ").slice(0, 500);
}

export function hasUsableSources(sourceIds: string[]) {
  return sourceIds.length > 0;
}

export function academicIntegrityNote() {
  return "Manbani asl bibliografik yozuv yoki elektron resurs bilan albatta solishtiring.";
}
