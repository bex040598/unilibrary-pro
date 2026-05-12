"use client";

import { useState } from "react";
import { Camera, ScanLine } from "lucide-react";

import { Badge, Button, Card, Input } from "@/components/ui/primitives";
import { OcrPayload, parseIdCardOcrMock } from "@/lib/identity/idCardOcrMock";

const toneByConfidence = {
  high: "emerald",
  medium: "gold",
  low: "rose"
} as const;

export function IDCardScanner({
  onExtract
}: {
  onExtract: (payload: OcrPayload) => void;
}) {
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<OcrPayload | null>(null);

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white">
          <Camera className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-semibold text-ink">ID card OCR mock</p>
          <p className="text-sm text-slate-600">Student guvohnomasi yoki ID karta yuklang, forma maydonlari avtomatik to&apos;ldiriladi.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <Input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setFileName(file.name);
          }}
        />
        <Button
          variant="secondary"
          onClick={() => {
            const parsed = parseIdCardOcrMock(fileName || "student-card.png");
            setResult(parsed);
            onExtract(parsed);
          }}
        >
          <ScanLine className="h-4 w-4" />
          Scan card
        </Button>
      </div>
      {result ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(result).map(([key, field]) => (
            <div key={key} className="rounded-2xl border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold capitalize text-ink">{key}</p>
                <Badge tone={toneByConfidence[field.confidence]}>{field.confidence}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-600">{field.value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
