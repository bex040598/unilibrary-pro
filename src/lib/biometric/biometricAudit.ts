import { AIConfidence, BiometricAuditLog, IdentityVerificationRecord, IdentityVerificationResult } from "@/types";

export function buildBiometricAuditLog(args: {
  userId: string;
  action: string;
  result: string;
  deviceInfo?: string;
}) {
  return {
    id: `biaudit-${args.userId}-${Date.now()}`,
    userId: args.userId,
    action: args.action,
    result: args.result,
    deviceInfo: args.deviceInfo ?? "Browser camera mock / WebAuthn-ready device",
    ipAddressMock: "10.42.0.24",
    createdAt: new Date().toISOString()
  } satisfies BiometricAuditLog;
}

export function buildIdentityVerificationRecord(args: {
  userId?: string;
  actorId?: string;
  method: IdentityVerificationRecord["method"];
  result: IdentityVerificationResult;
  confidence: AIConfidence;
  purpose: string;
  details: string;
}) {
  return {
    id: `identity-verify-${Date.now()}`,
    userId: args.userId,
    actorId: args.actorId,
    method: args.method,
    result: args.result,
    confidence: args.confidence,
    purpose: args.purpose,
    details: args.details,
    createdAt: new Date().toISOString()
  } satisfies IdentityVerificationRecord;
}
