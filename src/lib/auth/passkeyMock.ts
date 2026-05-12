import { PasskeyCredential } from "@/types";

function encodeText(value: string) {
  if (typeof window === "undefined") {
    return Buffer.from(value, "utf8").toString("base64");
  }

  return window.btoa(value);
}

export function createPasskeyCredentialMock(userId: string, deviceName: string) {
  const credentialId = `pk-${userId}-${Math.abs(deviceName.length * 73 + userId.length * 19)}`;
  return {
    id: `passkey-${userId}-${Date.now()}`,
    userId,
    credentialId,
    publicKeyMock: `pub-${encodeText(`${userId}:${deviceName}`)}`,
    deviceName,
    createdAt: new Date().toISOString(),
    lastUsedAt: undefined,
    status: "active"
  } satisfies PasskeyCredential;
}

export function explainPasskeyPrivacy() {
  return "Passkey qurilmangizdagi Face ID, fingerprint yoki PIN orqali ishlaydi. Biometrik ma'lumot serverga yuborilmaydi.";
}
