"use client";

import { useMemo, useState } from "react";

import { AIUsageDisclaimer } from "@/components/ai/AIUsageDisclaimer";
import { Badge, Button, Card, Label, Select } from "@/components/ui/primitives";
import { generateFlashcards } from "@/lib/ai/flashcardGenerator";
import { selectCurrentUser, useAppStore } from "@/features/store/useAppStore";
import { useToast } from "@/components/ui/toast";

export function FlashcardDeck() {
  const state = useAppStore();
  const currentUser = selectCurrentUser(state);
  const { push } = useToast();
  const records = useMemo(() => state.records.filter((record) => record.status === "published").slice(0, 20), [state.records]);
  const [recordId, setRecordId] = useState(records[0]?.id ?? "");

  if (!currentUser) return null;

  const cards = state.flashcards.filter((card) => card.userId === currentUser.id);

  return (
    <div className="space-y-6">
      <AIUsageDisclaimer />
      <Card className="space-y-4">
        <div>
          <Label>Book / resource</Label>
          <Select value={recordId} onChange={(event) => setRecordId(event.target.value)}>
            {records.map((record) => (
              <option key={record.id} value={record.id}>{record.title}</option>
            ))}
          </Select>
        </div>
        <Button
          onClick={() => {
            const record = state.records.find((item) => item.id === recordId);
            if (!record) return;
            const created = generateFlashcards({ userId: currentUser.id, record });
            const result = state.saveFlashcards(created);
            state.logAIUsage({
              userId: currentUser.id,
              feature: "flashcards",
              input: record.title,
              outputSummary: `${created.length} ta flashcard`,
              sourceIds: [record.id]
            });
            push({ tone: result.success ? "success" : "error", title: result.message });
          }}
        >
          Flashcard yaratish
        </Button>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Card key={card.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-ink">{card.term}</p>
              <Badge tone={card.status === "learned" ? "emerald" : card.status === "learning" ? "gold" : "cyan"}>
                {card.status}
              </Badge>
            </div>
            <p className="mt-3 text-sm text-slate-600">{card.definition}</p>
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => state.updateFlashcardStatus({ flashcardId: card.id, status: "learning", actorId: currentUser.id })}>
                O‘rganilmoqda
              </Button>
              <Button size="sm" onClick={() => state.updateFlashcardStatus({ flashcardId: card.id, status: "learned", actorId: currentUser.id })}>
                O‘zlashtirildi
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
