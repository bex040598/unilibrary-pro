import { AppState, User } from "@/types";
import { composeMockAnswer } from "@/lib/ai/mockLLM";
import { buildStudentRecommendations } from "@/lib/ai/recommendationEngine";
import { exploreResearchTopic } from "@/lib/ai/researchExplorer";
import { semanticSearchAll } from "@/lib/ai/semanticSearch";
import { AI_LIBRARY_DISCLAIMER, AI_LIBRARY_FALLBACK, sanitizePrompt } from "@/lib/ai/safety";

export type AIAnswerPayload = {
  answer: string;
  confidence: "high" | "medium" | "low";
  sourceIds: string[];
  followUps: string[];
  records: AppState["records"];
  resources: AppState["digitalResources"];
  disclaimer: string;
};

export function askLibraryAssistant(args: {
  state: AppState;
  user?: User | null;
  question: string;
}) {
  const question = sanitizePrompt(args.question);
  const matches = semanticSearchAll({
    query: question,
    records: args.state.records.filter((record) => record.status === "published"),
    resources: args.state.digitalResources,
    faculty: args.user?.faculty,
    department: args.user?.department,
    limit: 5
  });
  const reply = composeMockAnswer({
    question,
    records: matches.records,
    resources: matches.resources
  });

  return {
    answer: reply.answer || AI_LIBRARY_FALLBACK,
    confidence: reply.confidence,
    sourceIds: reply.sourceIds,
    followUps: reply.suggestions,
    records: matches.records,
    resources: matches.resources,
    disclaimer: AI_LIBRARY_DISCLAIMER
  } satisfies AIAnswerPayload;
}

export function buildSummaryFromRecord(args: { title: string; annotation: string; keywords: string[]; subjects: string[]; resourceType: string }) {
  const concepts = Array.from(new Set([...args.keywords, ...args.subjects])).slice(0, 6);
  return {
    summary: `${args.title} bibliografik yozuvi annotatsiyasi asosida ${args.resourceType.toLowerCase()} sifatida ${args.subjects[0] ?? "asosiy yo'nalish"} mavzusini izohlaydi. ${args.annotation}`,
    concepts,
    keyQuestions: [
      `${args.title} qaysi akademik vazifani yechishga yordam beradi?`,
      `Annotatsiyada qaysi tushunchalar markaziy o'rin tutadi?`,
      `Mazkur manba kurs yoki ilmiy ishda qayerda ishlatilishi mumkin?`,
      `Qaysi subject headinglar boshqa manbalarni topishga yordam beradi?`,
      `Manbani o'qigandan so'ng qanday xulosa chiqarish mumkin?`
    ],
    examTheses: [
      "Asosiy terminlarni ta'riflang.",
      "Mavzu doirasidagi amaliy qo'llanilishni izohlang.",
      "Subject heading va keywordlar orasidagi bog'liqlikni tushuntiring."
    ],
    discussionQuestions: [
      "O'qituvchi ushbu manbani qaysi seminar mavzusiga bog'lashi mumkin?",
      "Manba bilan yana qaysi bibliografik yozuvlarni juftlab o'qish foydali?",
      "Annotatsiyadagi yondashuv bugungi amaliyotga qanchalik mos?"
    ]
  };
}

export function buildStudentInsights(state: AppState, user: User) {
  return {
    recommendations: buildStudentRecommendations(state, user),
    researchProfile: Array.from(new Set(state.records.filter((record) => record.faculty === user.faculty).flatMap((record) => record.subjects))).slice(0, 5),
    nextResources: buildStudentRecommendations(state, user).slice(0, 3)
  };
}

export function buildResearchExplorerPayload(state: AppState, topic: string) {
  return exploreResearchTopic({
    topic,
    records: state.records.filter((record) => record.status === "published"),
    resources: state.digitalResources
  });
}
