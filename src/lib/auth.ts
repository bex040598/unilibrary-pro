const MOCK_PREFIX = "mock$";

export function encodeMockPassword(password: string) {
  if (typeof window === "undefined") {
    return `${MOCK_PREFIX}${Buffer.from(password, "utf8").toString("base64")}`;
  }

  return `${MOCK_PREFIX}${window.btoa(password)}`;
}

export function verifyMockPassword(storedHash: string, candidate: string) {
  return storedHash === encodeMockPassword(candidate);
}
