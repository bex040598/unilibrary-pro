"use client";

import { useMemo, useState } from "react";

import { AIUsageDisclaimer } from "@/components/ai/AIUsageDisclaimer";
import { Badge, Button, Card, Input, Label, Select } from "@/components/ui/primitives";
import { buildBibliographyExport, buildStyledCitation, getMissingMetadata } from "@/lib/ai/citationAssistant";
import { CitationStyle } from "@/types";
import { selectCurrentUser, useAppStore } from "@/features/store/useAppStore";
import { downloadTextFile } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

export function CitationAssistant() {
  const state = useAppStore();
  const currentUser = selectCurrentUser(state);
  const { push } = useToast();
  const records = useMemo(() => state.records.filter((record) => record.status === "published").slice(0, 25), [state.records]);
  const [recordId, setRecordId] = useState(records[0]?.id ?? "");
  const [style, setStyle] = useState<CitationStyle>("APA 7");
  const bibliography = state.bibliographyItems.filter((item) => item.userId === currentUser?.id);

  if (!currentUser) return null;

  const selectedRecord = state.records.find((item) => item.id === recordId);
  const missing = selectedRecord ? getMissingMetadata(selectedRecord) : [];

  return (
    <div className="space-y-6">
      <AIUsageDisclaimer />
      <Card className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Bibliographic record</Label>
            <Select value={recordId} onChange={(event) => setRecordId(event.target.value)}>
              {records.map((record) => (
                <option key={record.id} value={record.id}>{record.title}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Citation style</Label>
            <Select value={style} onChange={(event) => setStyle(event.target.value as CitationStyle)}>
              <option>APA 7</option>
              <option>MLA</option>
              <option>Chicago</option>
              <option>GOST-like</option>
              <option>Uzbek scientific</option>
            </Select>
          </div>
        </div>
        {selectedRecord ? (
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm text-slate-700">{buildStyledCitation(selectedRecord, style)}</p>
            {missing.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {missing.map((field) => (
                  <Badge key={field} tone="orange">Missing: {field}</Badge>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              if (!selectedRecord) return;
              const result = state.addBibliographyItem({
                recordId: selectedRecord.id,
                style,
                citationText: buildStyledCitation(selectedRecord, style)
              });
              state.logAIUsage({
                userId: currentUser.id,
                feature: "bibliography",
                input: selectedRecord.title,
                outputSummary: style,
                sourceIds: [selectedRecord.id]
              });
              push({ tone: result.success ? "success" : "error", title: result.message });
            }}
          >
            Bibliografiyaga qo‘shish
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (!selectedRecord) return;
              navigator.clipboard.writeText(buildStyledCitation(selectedRecord, style));
              push({ tone: "success", title: "Citation nusxalandi." });
            }}
          >
            Copy citation
          </Button>
        </div>
      </Card>
      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-lg font-semibold text-ink">My Bibliography</p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                downloadTextFile("bibliography.txt", buildBibliographyExport(bibliography.map((item) => item.citationText)));
                push({ tone: "success", title: "Bibliografiya TXT eksport qilindi." });
              }}
            >
              Export TXT
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                downloadTextFile("bibliography.csv", bibliography.map((item) => `"${item.style}","${item.citationText.replace(/"/g, '""')}"`).join("\n"));
                push({ tone: "success", title: "Bibliografiya CSV eksport qilindi." });
              }}
            >
              Export CSV
            </Button>
          </div>
        </div>
        <div className="grid gap-3">
          {bibliography.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm text-slate-700">{item.citationText}</p>
              <div className="mt-3 flex gap-2">
                <Badge tone="cyan">{item.style}</Badge>
                <Button variant="secondary" size="sm" onClick={() => state.removeBibliographyItem(item.id)}>
                  O‘chirish
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
