"use client";

import { Card } from "@/components/ui/primitives";
import { AI_ADVISORY_NOTE } from "@/lib/ai/safety";

export function AIUsageDisclaimer() {
  return (
    <Card muted className="border-dashed">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">AI Kutubxona Yordamchisi</p>
      <p className="mt-2 text-sm text-slate-600">{AI_ADVISORY_NOTE}</p>
    </Card>
  );
}
