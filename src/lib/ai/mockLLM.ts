import { BibliographicRecord, DigitalResource } from "@/types";
import { AI_LIBRARY_FALLBACK, academicIntegrityNote } from "@/lib/ai/safety";

export function composeMockAnswer(args: {
  question: string;
  records: BibliographicRecord[];
  resources: DigitalResource[];
}) {
  const primaryRecords = args.records.slice(0, 3);
  const primaryResources = args.resources.slice(0, 2);
  const sourceIds = [
    ...primaryRecords.map((record) => record.id),
    ...primaryResources.map((resource) => resource.id)
  ];

  if (!sourceIds.length) {
    return {
      answer: AI_LIBRARY_FALLBACK,
      confidence: "low" as const,
      sourceIds,
      suggestions: ["Qidiruv so'zini kengaytirib ko'ring.", "Faculty yoki subject heading bo'yicha izlang."]
    };
  }

  const answerLines = [
    `Savolingiz bo'yicha kutubxona fondidan ${sourceIds.length} ta mos manba topildi.`,
    primaryRecords.length
      ? `Asosiy bibliografik yozuvlar: ${primaryRecords.map((record) => `${record.title} (${record.id})`).join("; ")}.`
      : null,
    primaryResources.length
      ? `Elektron resurslar: ${primaryResources.map((resource) => `${resource.title} (${resource.id})`).join("; ")}.`
      : null,
    primaryRecords[0]
      ? `${primaryRecords[0].title} annotatsiyasi va subject headinglari asosida ushbu mavzu uchun tayanch manba sifatida tavsiya etiladi.`
      : null,
    academicIntegrityNote()
  ].filter(Boolean);

  return {
    answer: answerLines.join(" "),
    confidence: sourceIds.length > 3 ? "high" as const : "medium" as const,
    sourceIds,
    suggestions: [
      "Menga shu mavzu bo'yicha 14 kunlik o'qish reja tuz.",
      "Imtihon uchun 5 ta savol tuz.",
      "Bibliografiya ro'yxatini tayyorla."
    ]
  };
}
