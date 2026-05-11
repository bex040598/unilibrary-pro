"use client";

import { ScanLine } from "lucide-react";

import { Badge, Card } from "@/components/ui/primitives";

export function ScannerMock({
  title,
  code,
  mode
}: {
  title: string;
  code?: string;
  mode: "QR" | "Barcode" | "RFID";
}) {
  return (
    <Card className="overflow-hidden bg-slate-950 text-white">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-slate-400">Mock identification channel</p>
        </div>
        <Badge tone="cyan">{mode}</Badge>
      </div>
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6">
        <div className="absolute inset-x-0 top-0 h-16 animate-pulseline bg-gradient-to-b from-cyan-400/0 via-cyan-400/60 to-cyan-400/0" />
        <div className="grid min-h-[160px] place-items-center rounded-2xl border border-dashed border-cyan-300/40 bg-slate-900/60">
          <div className="text-center">
            <ScanLine className="mx-auto h-10 w-10 text-cyan-300" />
            <p className="mt-3 text-xs uppercase tracking-[0.28em] text-cyan-100">{mode} scan channel</p>
            <p className="mt-2 text-sm text-slate-300">{code ?? "Waiting for sample identifier..."}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
