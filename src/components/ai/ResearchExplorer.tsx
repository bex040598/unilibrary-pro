"use client";

import { useState } from "react";

import { AIUsageDisclaimer } from "@/components/ai/AIUsageDisclaimer";
import { Badge, Button, Card, Input, Label } from "@/components/ui/primitives";
import { buildResearchExplorerPayload } from "@/lib/ai/aiService";
import { selectCurrentUser, useAppStore } from "@/features/store/useAppStore";

export function ResearchExplorer() {
  const state = useAppStore();
  const currentUser = selectCurrentUser(state);
  const [topic, setTopic] = useState("Raqamli ta'limda sun'iy intellekt");
  const [result, setResult] = useState<ReturnType<typeof buildResearchExplorerPayload> | null>(null);

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      <AIUsageDisclaimer />
      <Card className="space-y-4">
        <div>
          <Label>Research topic</Label>
          <Input value={topic} onChange={(event) => setTopic(event.target.value)} />
        </div>
        <Button
          onClick={() => {
            const next = buildResearchExplorerPayload(state, topic);
            state.logAIUsage({
              userId: currentUser.id,
              feature: "research_explorer",
              input: topic,
              outputSummary: `${next.records.length} record, ${next.resources.length} resource`,
              sourceIds: [...next.records.map((record) => record.id), ...next.resources.map((resource) => resource.id)]
            });
            setResult(next);
          }}
        >
          Tadqiqot yo‘nalishini tahlil qilish
        </Button>
      </Card>
      {result ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <Card className="space-y-4">
            <p className="text-lg font-semibold text-ink">Mos resurslar</p>
            {result.records.slice(0, 5).map((record) => (
              <div key={record.id} className="rounded-2xl border border-slate-200 p-4">
                <p className="font-semibold text-ink">{record.title}</p>
                <p className="mt-1 text-sm text-slate-500">{record.authors.join(", ")}</p>
              </div>
            ))}
            {result.resources.slice(0, 5).map((resource) => (
              <div key={resource.id} className="rounded-2xl border border-slate-200 p-4">
                <p className="font-semibold text-ink">{resource.title}</p>
                <p className="mt-1 text-sm text-slate-500">{resource.type} • {resource.faculty}</p>
              </div>
            ))}
          </Card>
          <div className="space-y-6">
            <Card>
              <p className="text-lg font-semibold text-ink">Keywords va subject headings</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[...result.keywords, ...result.subjectHeadings].slice(0, 12).map((item) => (
                  <Badge key={item} tone="cyan">{item}</Badge>
                ))}
              </div>
            </Card>
            <Card>
              <p className="text-lg font-semibold text-ink">Research questions</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {result.researchQuestions.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            </Card>
            <Card>
              <p className="text-lg font-semibold text-ink">IMRAD outline</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {result.articleOutline.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </Card>
            <Card>
              <p className="text-lg font-semibold text-ink">Recommended reading order</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {result.readingOrder.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
