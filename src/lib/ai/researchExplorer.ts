import { BibliographicRecord, DigitalResource } from "@/types";
import { semanticSearchAll } from "@/lib/ai/semanticSearch";

export function exploreResearchTopic(args: {
  topic: string;
  records: BibliographicRecord[];
  resources: DigitalResource[];
}) {
  const matches = semanticSearchAll({
    query: args.topic,
    records: args.records,
    resources: args.resources,
    limit: 10
  });
  const keywords = Array.from(
    new Set(
      [...matches.records.flatMap((record) => record.keywords), ...matches.resources.flatMap((resource) => resource.keywords)]
        .filter(Boolean)
        .slice(0, 12)
    )
  );
  const subjectHeadings = Array.from(new Set(matches.records.flatMap((record) => record.subjects))).slice(0, 8);

  return {
    records: matches.records,
    resources: matches.resources,
    keywords,
    subjectHeadings,
    researchQuestions: [
      `${args.topic} mavzusida amaliy muammolar qanday ko'rinish oladi?`,
      `${args.topic} bo'yicha mavjud adabiyotlarda qaysi bo'shliqlar ko'zga tashlanadi?`,
      `${args.topic}ni o'quv jarayonida joriy etish uchun qanday mezonlar muhim?`
    ],
    articleOutline: [
      "Introduction: mavzuning dolzarbligi va muammo bayoni",
      "Methods: tanlangan adabiyotlar va tahlil yondashuvi",
      "Results: asosiy kuzatuvlar va taqqoslash",
      "Discussion: amaliy ahamiyat va cheklovlar",
      "Conclusion: xulosa va keyingi izlanish yo'nalishlari"
    ],
    readingOrder: matches.records.slice(0, 5).map((record, index) => `${index + 1}. ${record.title}`)
  };
}
