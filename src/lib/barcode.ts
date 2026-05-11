export function createBarcode(seed: string) {
  return `BAR-${seed.replace(/[^A-Z0-9]/gi, "").slice(0, 12).toUpperCase()}`;
}

export function createQrCode(seed: string) {
  return `QR:${seed}:${Math.abs(seed.split("").reduce((acc, item) => acc + item.charCodeAt(0), 0))}`;
}

export function createRfidTag(seed: string) {
  return `RFID-${seed.slice(-4).toUpperCase()}-${seed.length * 37}`;
}
