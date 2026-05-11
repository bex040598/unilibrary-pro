"use client";

import { useMemo, useState } from "react";

import { AIChatBox, ChatMessageView } from "@/components/ai/AIChatBox";
import { AIUsageDisclaimer } from "@/components/ai/AIUsageDisclaimer";
import { AIRecommendationCard } from "@/components/ai/AIRecommendationCard";
import { Card } from "@/components/ui/primitives";
import { aiQuickActions } from "@/lib/ai/prompts";
import { askLibraryAssistant } from "@/lib/ai/aiService";
import { selectCurrentUser, useAppStore } from "@/features/store/useAppStore";

export function AIAssistantPanel({
  promptSeed,
  title = "AI Kutubxona Yordamchisi"
}: {
  promptSeed?: string;
  title?: string;
}) {
  const state = useAppStore();
  const currentUser = selectCurrentUser(state);
  const [loading, setLoading] = useState(false);
  const initialMessages = useMemo<ChatMessageView[]>(
    () =>
      state.aiChats
        .filter((item) => !currentUser || item.userId === currentUser.id)
        .slice(0, 6)
        .reverse()
        .map((item) => ({
          id: item.id,
          role: item.role,
          content: item.content,
          confidence: item.confidence,
          sources: item.sources
        })),
    [currentUser, state.aiChats]
  );
  const [messages, setMessages] = useState<ChatMessageView[]>(
    initialMessages.length
      ? initialMessages
      : [
          {
            id: "assistant-welcome",
            role: "assistant",
            content:
              "Kutubxona fondi bo'yicha savol bering. Men faqat katalog va repositorydagi mavjud manbalarga tayangan holda javob beraman.",
            confidence: "medium"
          }
        ]
  );
  const [sourceCards, setSourceCards] = useState<{ id: string; title: string; href: string; reason: string }[]>([]);

  const handleAsk = async (question: string) => {
    const finalQuestion = promptSeed ? `${promptSeed}. ${question}` : question;
    setLoading(true);
    const answer = askLibraryAssistant({
      state,
      user: currentUser,
      question: finalQuestion
    });
    const nextMessages: ChatMessageView[] = [
      ...messages,
      { id: `user-${Date.now()}`, role: "user", content: question },
      {
        id: `assistant-${Date.now() + 1}`,
        role: "assistant",
        content: answer.answer,
        confidence: answer.confidence,
        sources: answer.sourceIds
      }
    ];
    setMessages(nextMessages);
    if (currentUser) {
      state.appendAIChat({
        userId: currentUser.id,
        role: "user",
        content: question,
        sources: [],
        confidence: "medium"
      });
      state.appendAIChat({
        userId: currentUser.id,
        role: "assistant",
        content: answer.answer,
        sources: answer.sourceIds,
        confidence: answer.confidence
      });
      state.logAIUsage({
        userId: currentUser.id,
        feature: "ai_assistant",
        input: question,
        outputSummary: answer.answer.slice(0, 160),
        sourceIds: answer.sourceIds
      });
    }

    setSourceCards([
      ...answer.records.map((record) => ({
        id: record.id,
        title: record.title,
        href: `/catalog/${record.id}`,
        reason: `Manba ID ${record.id} bo'yicha subject heading va keywordlar mos keldi.`
      })),
      ...answer.resources.map((resource) => ({
        id: resource.id,
        title: resource.title,
        href: `/repository/${resource.id}`,
        reason: `Elektron resurs ${resource.id} bo'yicha abstract va keywordlar mos keldi.`
      }))
    ]);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-lg font-semibold text-ink">{title}</p>
        <p className="mt-2 text-sm text-slate-600">
          Javoblar katalog va repositorydagi mavjud yozuvlarga tayangan holda shakllanadi.
        </p>
      </Card>
      <AIUsageDisclaimer />
      <AIChatBox messages={messages} quickActions={aiQuickActions} onSend={handleAsk} loading={loading} />
      {sourceCards.length ? (
        <div className="space-y-3">
          {sourceCards.slice(0, 4).map((card) => (
            <AIRecommendationCard
              key={card.id}
              title={card.title}
              reason={card.reason}
              category="Kutubxona fondidan topildi"
              difficulty="intermediate"
              estimatedReadingTime="2-6 soat"
              availability="manba ko'rish uchun ochiq"
              href={card.href}
              actionLabel="Manbani ochish"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
