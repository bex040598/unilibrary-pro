import { BibliographicRecord, Quiz, QuizQuestion, ReadingPlanLevel } from "@/types";
import { makeId } from "@/lib/utils";

function buildOptions(answer: string, context: string[]) {
  const alternatives = context.filter((item) => item !== answer).slice(0, 3);
  return [answer, ...alternatives].slice(0, 4).sort((a, b) => a.localeCompare(b));
}

export function generateQuiz(args: {
  userId: string;
  record: BibliographicRecord;
  topic: string;
  difficulty: ReadingPlanLevel;
  questionCount: number;
}) {
  const keywords = args.record.keywords.slice(0, 5);
  const pool: QuizQuestion[] = [];

  pool.push({
    id: makeId("quizq", 1),
    question: `"${args.record.title}" asarining asosiy yo'nalishi qaysi?`,
    options: buildOptions(args.record.faculty, [args.record.faculty, args.record.department, args.record.publisher, args.record.language]),
    correctAnswer: args.record.faculty,
    explanation: `Bibliografik yozuvda faculty maydoni ${args.record.faculty} deb ko'rsatilgan.`,
    difficulty: args.difficulty,
    questionType: "multiple-choice"
  });
  pool.push({
    id: makeId("quizq", 2),
    question: `${args.record.title} uchun qaysi kalit so'z tegishli?`,
    options: buildOptions(keywords[0] ?? args.record.title, [...keywords, args.record.publisher, args.record.language]),
    correctAnswer: keywords[0] ?? args.record.title,
    explanation: "Savol yozuvning keyword maydoni asosida tuzildi.",
    difficulty: args.difficulty,
    questionType: "multiple-choice"
  });
  pool.push({
    id: makeId("quizq", 3),
    question: `${args.record.title} nashriyoti to'g'rimi?`,
    options: ["To'g'ri", "Noto'g'ri"],
    correctAnswer: "To'g'ri",
    explanation: `${args.record.publisher} bibliografik yozuvdagi publisher maydonida mavjud.`,
    difficulty: args.difficulty,
    questionType: "true-false"
  });
  pool.push({
    id: makeId("quizq", 4),
    question: `${args.record.title} bo'yicha qisqa javob: bu manba ko'proq qaysi mavzularni qamrab oladi?`,
    options: [],
    correctAnswer: args.record.subjects.join(", "),
    explanation: "Javob subject heading va annotationdan hosil qilinadi.",
    difficulty: args.difficulty,
    questionType: "short-answer"
  });

  const questions = pool.slice(0, Math.max(1, Math.min(args.questionCount, pool.length)));
  const quiz: Quiz = {
    id: makeId("quiz", Date.now() % 100000),
    userId: args.userId,
    topic: args.topic,
    resourceId: args.record.id,
    questions,
    totalQuestions: questions.length,
    createdAt: new Date().toISOString()
  };

  return quiz;
}
