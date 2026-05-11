"use client";

import { FormEvent, useState } from "react";

import { Badge, Button, Card, Input } from "@/components/ui/primitives";

export type ChatMessageView = {
  id: string;
  role: "user" | "assistant";
  content: string;
  confidence?: "high" | "medium" | "low";
  sources?: string[];
};

export function AIChatBox({
  messages,
  quickActions,
  onSend,
  loading
}: {
  messages: ChatMessageView[];
  quickActions: readonly string[];
  onSend: (question: string) => Promise<void> | void;
  loading?: boolean;
}) {
  const [value, setValue] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!value.trim()) return;
    const question = value.trim();
    setValue("");
    await onSend(question);
  };

  return (
    <Card className="space-y-4">
      <div className="space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-3xl p-4 ${message.role === "assistant" ? "bg-slate-50" : "bg-cyan-50"}`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {message.role === "assistant" ? "AI yordamchi" : "Siz"}
              </p>
              {message.confidence ? <Badge tone={message.confidence === "high" ? "emerald" : message.confidence === "medium" ? "gold" : "rose"}>{message.confidence}</Badge> : null}
            </div>
            <p className="mt-2 text-sm text-slate-700">{message.content}</p>
            {message.sources?.length ? (
              <p className="mt-3 text-xs text-slate-500">Source IDs: {message.sources.join(", ")}</p>
            ) : null}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <Button key={action} variant="secondary" size="sm" onClick={() => onSend(action)}>
            {action}
          </Button>
        ))}
      </div>
      <form onSubmit={submit} className="flex gap-3">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Savolingizni yozing"
          aria-label="AI kutubxona yordamchisiga savol"
        />
        <Button type="submit" disabled={loading}>{loading ? "Kutilyapti..." : "Yuborish"}</Button>
      </form>
    </Card>
  );
}
