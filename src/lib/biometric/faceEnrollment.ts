import { BiometricConsent, BiometricProfile } from "@/types";
import { createFaceTemplateHashMock } from "@/lib/biometric/faceTemplate";

export const biometricConsentText =
  "Face ID kutubxona kabinetiga kirish, o'quv zali check-in va circulation tasdig'i uchun ishlatiladi. Tizim xom suratni saqlamaydi, faqat mock shifrlangan yuz shablonini saqlaydi. Foydalanuvchi istalgan payt consentni bekor qilishi yoki Face IDni o'chirishi mumkin.";

export function buildBiometricConsent(userId: string, version = "2026.05") {
  return {
    id: `consent-${userId}`,
    userId,
    purpose: "Face ID login and verification",
    consentText: biometricConsentText,
    grantedAt: new Date().toISOString(),
    status: "granted"
  } satisfies BiometricConsent;
}

export function buildBiometricProfile(args: {
  userId: string;
  templateSeed: string;
  livenessScore: number;
  consentVersion?: string;
}) {
  return {
    id: `bio-${args.userId}`,
    userId: args.userId,
    enabled: true,
    templateHashMock: createFaceTemplateHashMock(args.templateSeed),
    livenessScore: args.livenessScore,
    enrolledAt: new Date().toISOString(),
    lastVerifiedAt: new Date().toISOString(),
    consentVersion: args.consentVersion ?? "2026.05",
    status: "active"
  } satisfies BiometricProfile;
}
