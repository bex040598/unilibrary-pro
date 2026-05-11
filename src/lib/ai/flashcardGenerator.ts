import { BibliographicRecord, Flashcard } from "@/types";
import { makeId } from "@/lib/utils";

export function generateFlashcards(args: {
  userId: string;
  record: BibliographicRecord;
}) {
  const terms = Array.from(new Set([args.record.title, ...args.record.keywords, ...args.record.subjects])).slice(0, 8);

  return terms.map((term, index) => ({
    id: makeId("flash", Date.now() % 100000 + index),
    userId: args.userId,
    term,
    definition:
      term === args.record.title
        ? args.record.annotation
        : `${term} mavzusi ${args.record.title} bibliografik yozuvida kalit tushuncha sifatida uchraydi.`,
    sourceId: args.record.id,
    status: "new" as const,
    nextReviewAt: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString()
  }));
}
