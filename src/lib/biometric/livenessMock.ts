export const livenessSteps = [
  "Look at the camera",
  "Blink",
  "Turn head slightly left",
  "Turn head slightly right",
  "Smile"
] as const;

export function evaluateLivenessMock(seed: string, completedSteps: number) {
  const normalized = seed.trim().toLowerCase();
  if (!normalized || normalized.includes("fail")) {
    return {
      success: false,
      score: 0.36,
      result: "liveness_failed" as const
    };
  }

  const ratio = completedSteps / livenessSteps.length;
  const score = Math.min(0.99, 0.74 + ratio * 0.22);
  return {
    success: completedSteps >= livenessSteps.length,
    score,
    result: completedSteps >= livenessSteps.length ? ("matched" as const) : ("liveness_failed" as const)
  };
}
