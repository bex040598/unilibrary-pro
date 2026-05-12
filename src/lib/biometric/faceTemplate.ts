function encodeText(value: string) {
  if (typeof window === "undefined") {
    return Buffer.from(value, "utf8").toString("base64");
  }

  return window.btoa(value);
}

function normalizeSeed(seed: string) {
  return seed.trim().toLowerCase().replace(/\s+/g, "|");
}

export function createFaceTemplateHashMock(seed: string) {
  const normalized = normalizeSeed(seed);
  return `face$${encodeText(`unilibrary-face:${normalized}`)}`;
}

export function compareFaceTemplateHashMock(savedTemplate: string, probeSeed: string) {
  const probeTemplate = createFaceTemplateHashMock(probeSeed);
  const matched = savedTemplate === probeTemplate;

  return {
    matched,
    confidence: matched ? 0.96 : 0.28,
    probeTemplate
  };
}
