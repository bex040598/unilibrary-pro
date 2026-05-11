"use client";

import Link from "next/link";

import { Badge, Button, Card } from "@/components/ui/primitives";

export function AIRecommendationCard({
  title,
  reason,
  category,
  difficulty,
  estimatedReadingTime,
  availability,
  href,
  actionLabel = "Ko'rish",
  secondaryActionLabel,
  onSecondaryAction
}: {
  title: string;
  reason: string;
  category: string;
  difficulty: string;
  estimatedReadingTime: string;
  availability: string;
  href: string;
  actionLabel?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}) {
  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="cyan">Kutubxona fondidan topildi</Badge>
        <Badge tone={difficulty === "advanced" ? "rose" : difficulty === "intermediate" ? "gold" : "emerald"}>
          {difficulty}
        </Badge>
      </div>
      <div>
        <p className="text-lg font-semibold text-ink">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{category}</p>
      </div>
      <p className="text-sm text-slate-600">{reason}</p>
      <div className="grid gap-2 text-sm text-slate-500 md:grid-cols-2">
        <p>O‘qish vaqti: {estimatedReadingTime}</p>
        <p>Mavjudlik: {availability}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Link href={href}>
          <Button variant="secondary" className="w-full">{actionLabel}</Button>
        </Link>
        {secondaryActionLabel && onSecondaryAction ? (
          <Button className="w-full" onClick={onSecondaryAction}>{secondaryActionLabel}</Button>
        ) : null}
      </div>
    </Card>
  );
}
