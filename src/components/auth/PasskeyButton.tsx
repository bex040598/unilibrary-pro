"use client";

import { ShieldCheck } from "lucide-react";

import { Button, Card } from "@/components/ui/primitives";
import { explainPasskeyPrivacy } from "@/lib/auth/passkeyMock";

export function PasskeyButton({
  label,
  onClick,
  compact = false
}: {
  label: string;
  onClick: () => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <Button variant="secondary" onClick={onClick}>
        <ShieldCheck className="h-4 w-4" />
        {label}
      </Button>
    );
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-ink">{label}</p>
          <p className="mt-1 text-sm text-slate-600">{explainPasskeyPrivacy()}</p>
        </div>
      </div>
      <Button variant="secondary" onClick={onClick}>
        <ShieldCheck className="h-4 w-4" />
        {label}
      </Button>
    </Card>
  );
}
