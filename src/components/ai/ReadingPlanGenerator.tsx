"use client";

import { useState } from "react";

import { AIUsageDisclaimer } from "@/components/ai/AIUsageDisclaimer";
import { Badge, Button, Card, Input, Label, Select } from "@/components/ui/primitives";
import { generateReadingPlan } from "@/lib/ai/readingPlanGenerator";
import { selectCurrentUser, useAppStore } from "@/features/store/useAppStore";
import { useToast } from "@/components/ui/toast";

export function ReadingPlanGenerator() {
  const state = useAppStore();
  const currentUser = selectCurrentUser(state);
  const { push } = useToast();
  const [topic, setTopic] = useState("Sun'iy intellekt asoslari");
  const [goal, setGoal] = useState("Imtihonga tayyorgarlik");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [durationDays, setDurationDays] = useState(14);
  const [language, setLanguage] = useState("O'zbek");
  const [resourceTypePreference, setResourceTypePreference] = useState("Printed book");
  const [previewPlanId, setPreviewPlanId] = useState<string | null>(null);

  const previewPlan = state.readingPlans.find((plan) => plan.id === previewPlanId) ?? state.readingPlans[0];

  if (!currentUser) {
    return null;
  }

  return (
    <div className="space-y-6">
      <AIUsageDisclaimer />
      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Topic</Label>
            <Input value={topic} onChange={(event) => setTopic(event.target.value)} />
          </div>
          <div>
            <Label>Goal</Label>
            <Input value={goal} onChange={(event) => setGoal(event.target.value)} />
          </div>
          <div>
            <Label>Level</Label>
            <Select value={level} onChange={(event) => setLevel(event.target.value as typeof level)}>
              <option value="beginner">beginner</option>
              <option value="intermediate">intermediate</option>
              <option value="advanced">advanced</option>
            </Select>
          </div>
          <div>
            <Label>Duration</Label>
            <Select value={String(durationDays)} onChange={(event) => setDurationDays(Number(event.target.value))}>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </Select>
          </div>
          <div>
            <Label>Language</Label>
            <Input value={language} onChange={(event) => setLanguage(event.target.value)} />
          </div>
          <div>
            <Label>Resource type preference</Label>
            <Input value={resourceTypePreference} onChange={(event) => setResourceTypePreference(event.target.value)} />
          </div>
        </div>
        <div className="mt-4">
          <Button
            onClick={() => {
              const { plan } = generateReadingPlan({
                userId: currentUser.id,
                topic,
                goal,
                level,
                durationDays,
                language,
                resourceTypePreference,
                records: state.records.filter((record) => record.status === "published")
              });
              const result = state.saveReadingPlan(plan);
              state.logAIUsage({
                userId: currentUser.id,
                feature: "reading_plan",
                input: topic,
                outputSummary: plan.expectedOutcome,
                sourceIds: plan.items.flatMap((item) => item.resourceIds)
              });
              setPreviewPlanId(plan.id);
              push({ tone: result.success ? "success" : "error", title: result.message });
            }}
          >
            O‘qish rejasini yaratish
          </Button>
        </div>
      </Card>
      {previewPlan ? (
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-ink">{previewPlan.topic}</p>
              <p className="mt-1 text-sm text-slate-500">{previewPlan.goal}</p>
            </div>
            <Badge tone="emerald">{previewPlan.durationDays} kun</Badge>
          </div>
          <p className="text-sm text-slate-600">{previewPlan.expectedOutcome}</p>
          <div className="grid gap-3">
            {previewPlan.items.slice(0, 8).map((item) => (
              <div key={`${previewPlan.id}-${item.day}`} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{item.title}</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => state.toggleReadingPlanItem({ planId: previewPlan.id, day: item.day, actorId: currentUser.id })}
                  >
                    {item.completed ? "Qayta ochish" : "Bajarildi"}
                  </Button>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.task}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
