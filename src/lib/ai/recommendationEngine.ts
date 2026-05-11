import { AIRecommendation, AppState, BibliographicRecord, User } from "@/types";
import { makeId } from "@/lib/utils";

export type RecommendationView = AIRecommendation & {
  title: string;
  availability: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedReadingTime: string;
};

function estimateDifficulty(record: BibliographicRecord) {
  if (record.pages < 220 && record.resourceType !== "Thesis") return "beginner" as const;
  if (record.pages < 360) return "intermediate" as const;
  return "advanced" as const;
}

function estimateReadingTime(record: BibliographicRecord) {
  const hours = Math.max(2, Math.round(record.pages / 35));
  return `${hours} soat`;
}

function availability(state: AppState, recordId: string) {
  const total = state.copies.filter((copy) => copy.recordId === recordId).length;
  const available = state.copies.filter((copy) => copy.recordId === recordId && copy.status === "available").length;
  return `${available}/${total} nusxa`;
}

export function buildStudentRecommendations(state: AppState, user: User): RecommendationView[] {
  const reservedRecordIds = new Set(
    state.reservations.filter((reservation) => reservation.userId === user.id).map((reservation) => reservation.recordId)
  );
  const borrowedRecordIds = new Set(
    state.loans
      .filter((loan) => loan.userId === user.id)
      .map((loan) => state.copies.find((copy) => copy.id === loan.copyId)?.recordId)
      .filter(Boolean) as string[]
  );
  const recentlyViewedResourceIds = state.auditLogs
    .filter((log) => log.userId === user.id && log.action === "VIEW_RESOURCE")
    .slice(0, 6)
    .map((log) => log.entityId);

  const scored = state.records
    .filter((record) => record.status === "published")
    .map((record) => {
      const category =
        record.faculty === user.faculty
          ? "Sizning yo'nalishingiz uchun"
          : record.department === user.department
            ? "Fanlaringizga mos adabiyotlar"
            : record.isNewArrival
              ? "Yangi kelgan adabiyotlar"
              : record.resourceType === "E-book"
                ? "Elektron o'qish mumkin bo'lgan resurslar"
                : record.pages < 220
                  ? "Boshlovchilar uchun oson manbalar"
                  : "Ilmiy ish uchun foydali manbalar";

      let score = 0;
      if (record.faculty === user.faculty) score += 28;
      if (record.department === user.department) score += 22;
      if (record.isNewArrival) score += 12;
      if (record.borrowCount > 40) score += 14;
      if (record.pages < 220) score += 8;
      if (borrowedRecordIds.has(record.id)) score -= 20;
      if (reservedRecordIds.has(record.id)) score -= 14;
      if (
        recentlyViewedResourceIds.some((resourceId) => {
          const resource = state.digitalResources.find((item) => item.id === resourceId);
          return resource?.recordId === record.id || resource?.faculty === record.faculty;
        })
      ) {
        score += 18;
      }

      return {
        id: makeId("airec", score + record.borrowCount + record.title.length),
        userId: user.id,
        recordId: record.id,
        reason:
          category === "Sizning yo'nalishingiz uchun"
            ? `${user.faculty} fakulteti uchun subject heading va borrow statistikasi mos keldi.`
            : category === "Fanlaringizga mos adabiyotlar"
              ? `${user.department} bo'yicha kalit so'zlar va kurs mavzulari mos topildi.`
              : category === "Yangi kelgan adabiyotlar"
                ? "Yaqinda katalogga qo'shilgan va o'quv jarayoniga mos yangi nashr."
                : category === "Elektron o'qish mumkin bo'lgan resurslar"
                  ? "Elektron formatda o'qish mumkin va tezkor foydalanish uchun qulay."
                  : category === "Boshlovchilar uchun oson manbalar"
                    ? "Hajmi va terminologiyasi kirish bosqichi uchun qulay."
                    : "Tadqiqot va kurs ishlarida foydalanish uchun bibliografik qamrovi boy.",
        score,
        category,
        createdAt: new Date().toISOString(),
        title: record.title,
        availability: availability(state, record.id),
        difficulty: estimateDifficulty(record),
        estimatedReadingTime: estimateReadingTime(record)
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 14);

  return scored;
}
