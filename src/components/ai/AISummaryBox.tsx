"use client";

import { Badge, Card } from "@/components/ui/primitives";

export function AISummaryBox({
  title,
  summary,
  concepts,
  keyQuestions,
  examTheses,
  discussionQuestions
}: {
  title: string;
  summary: string;
  concepts: string[];
  keyQuestions: string[];
  examTheses: string[];
  discussionQuestions: string[];
}) {
  return (
    <Card className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">AI qisqacha mazmun</p>
        <h3 className="mt-2 text-lg font-semibold text-ink">{title}</h3>
        <p className="mt-3 text-sm text-slate-700">{summary}</p>
      </div>
      <div>
        <p className="text-sm font-semibold text-ink">Asosiy tushunchalar</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {concepts.map((concept) => (
            <Badge key={concept} tone="cyan">{concept}</Badge>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-ink">5 ta muhim savol</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {keyQuestions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Imtihon uchun tezislar</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {examTheses.map((thesis) => (
              <li key={thesis}>{thesis}</li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-ink">O‘qituvchi uchun muhokama savollari</p>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          {discussionQuestions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
