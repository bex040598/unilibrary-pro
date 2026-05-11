"use client";

import { useMemo, useState } from "react";

import { AIUsageDisclaimer } from "@/components/ai/AIUsageDisclaimer";
import { Badge, Button, Card, Input, Label, Select } from "@/components/ui/primitives";
import { generateQuiz } from "@/lib/ai/quizGenerator";
import { selectCurrentUser, useAppStore } from "@/features/store/useAppStore";
import { useToast } from "@/components/ui/toast";

export function QuizGenerator() {
  const state = useAppStore();
  const currentUser = selectCurrentUser(state);
  const { push } = useToast();
  const records = useMemo(() => state.records.filter((record) => record.status === "published").slice(0, 20), [state.records]);
  const [recordId, setRecordId] = useState(records[0]?.id ?? "");
  const [topic, setTopic] = useState(records[0]?.title ?? "AI quiz");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [questionCount, setQuestionCount] = useState(4);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const activeQuiz = state.quizzes.find((quiz) => quiz.id === activeQuizId);

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      <AIUsageDisclaimer />
      <Card className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Book / resource</Label>
            <Select
              value={recordId}
              onChange={(event) => {
                setRecordId(event.target.value);
                const record = records.find((item) => item.id === event.target.value);
                setTopic(record?.title ?? topic);
              }}
            >
              {records.map((record) => (
                <option key={record.id} value={record.id}>{record.title}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Topic</Label>
            <Input value={topic} onChange={(event) => setTopic(event.target.value)} />
          </div>
          <div>
            <Label>Difficulty</Label>
            <Select value={difficulty} onChange={(event) => setDifficulty(event.target.value as typeof difficulty)}>
              <option value="beginner">beginner</option>
              <option value="intermediate">intermediate</option>
              <option value="advanced">advanced</option>
            </Select>
          </div>
          <div>
            <Label>Questions</Label>
            <Select value={String(questionCount)} onChange={(event) => setQuestionCount(Number(event.target.value))}>
              <option value="3">3</option>
              <option value="4">4</option>
            </Select>
          </div>
        </div>
        <Button
          onClick={() => {
            const record = state.records.find((item) => item.id === recordId);
            if (!record) return;
            const quiz = generateQuiz({ userId: currentUser.id, record, topic, difficulty, questionCount });
            const result = state.saveQuiz(quiz);
            state.logAIUsage({
              userId: currentUser.id,
              feature: "quiz_generator",
              input: topic,
              outputSummary: `${quiz.totalQuestions} savollik quiz`,
              sourceIds: [record.id]
            });
            setActiveQuizId(quiz.id);
            setAnswers({});
            push({ tone: result.success ? "success" : "error", title: result.message });
          }}
        >
          Test yaratish
        </Button>
      </Card>
      {activeQuiz ? (
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-lg font-semibold text-ink">{activeQuiz.topic}</p>
            {typeof activeQuiz.score === "number" ? <Badge tone="emerald">{activeQuiz.score}/{activeQuiz.totalQuestions}</Badge> : null}
          </div>
          {activeQuiz.questions.map((question) => (
            <div key={question.id} className="rounded-2xl border border-slate-200 p-4">
              <p className="font-semibold text-ink">{question.question}</p>
              {question.questionType === "short-answer" ? (
                <Input
                  className="mt-3"
                  value={answers[question.id] ?? ""}
                  onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))}
                />
              ) : (
                <div className="mt-3 space-y-2">
                  {question.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                      className={`block w-full rounded-2xl border px-4 py-3 text-left text-sm ${
                        answers[question.id] === option ? "border-cyan-400 bg-cyan-50" : "border-slate-200"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
              {typeof activeQuiz.score === "number" ? (
                <p className="mt-3 text-sm text-slate-500">To‘g‘ri javob: {question.correctAnswer}. {question.explanation}</p>
              ) : null}
            </div>
          ))}
          <Button
            onClick={() => {
              const score = activeQuiz.questions.reduce((total, question) => {
                if (question.questionType === "short-answer") {
                  return answers[question.id]?.toLocaleLowerCase().includes(question.correctAnswer.toLocaleLowerCase().slice(0, 6))
                    ? total + 1
                    : total;
                }
                return answers[question.id] === question.correctAnswer ? total + 1 : total;
              }, 0);
              const result = state.scoreQuiz({ quizId: activeQuiz.id, score, actorId: currentUser.id });
              push({ tone: result.success ? "success" : "error", title: `${result.message} Ball: ${score}/${activeQuiz.totalQuestions}` });
            }}
          >
            Natijani hisoblash
          </Button>
        </Card>
      ) : null}
    </div>
  );
}
