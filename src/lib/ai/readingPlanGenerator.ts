import { BibliographicRecord, ReadingPlan, ReadingPlanLevel } from "@/types";
import { makeId } from "@/lib/utils";
import { semanticSearchRecords } from "@/lib/ai/semanticSearch";

export function generateReadingPlan(args: {
  userId: string;
  topic: string;
  goal: string;
  level: ReadingPlanLevel;
  durationDays: number;
  language: string;
  resourceTypePreference: string;
  records: BibliographicRecord[];
}) {
  const matched = semanticSearchRecords(args.records, args.topic, { limit: 6 });
  const days = Array.from({ length: args.durationDays }, (_, index) => index + 1);
  const segments = Math.max(1, Math.floor(args.durationDays / 4));

  const items = days.map((day, index) => {
    const resource = matched[index % Math.max(matched.length, 1)];
    const focus =
      index < segments
        ? "asosiy tushunchalar"
        : index < segments * 2
          ? "amaliy misollar"
          : index < segments * 3
            ? "tahlil va taqqoslash"
            : "mustahkamlash va o'zini tekshirish";

    return {
      day,
      title: `Kun ${day}: ${focus}`,
      task: resource
        ? `${resource.title} asosida ${focus} bo'yicha o'qish va konspekt tuzish.`
        : `${args.topic} bo'yicha katalogdan topilgan manbalarni qayta ko'rib chiqish.`,
      resourceIds: resource ? [resource.id] : [],
      selfCheckQuestions: [
        `${args.topic} mavzusida bugun o'rgangan 3 ta atamani yozing.`,
        `${focus} bo'yicha bir amaliy misol keltiring.`,
        `Manba bo'yicha savol tug'ilsa, uni alohida qayd eting.`
      ],
      completed: false
    };
  });

  const expectedOutcome =
    args.level === "beginner"
      ? "Mavzuning tayanch terminlari va asosiy jarayonlarini tushunish."
      : args.level === "intermediate"
        ? "Mavzu bo'yicha taqqoslash va kichik tahlil tayyorlash."
        : "Ilmiy izlanish yoki kurs ishi uchun mustahkam bibliografik tayyorgarlik.";

  const plan: ReadingPlan = {
    id: makeId("plan", Date.now() % 100000),
    userId: args.userId,
    topic: args.topic,
    goal: args.goal,
    level: args.level,
    durationDays: args.durationDays,
    items,
    language: args.language,
    resourceTypePreference: args.resourceTypePreference,
    expectedOutcome,
    createdAt: new Date().toISOString(),
    status: "active"
  };

  return { plan, resources: matched };
}
