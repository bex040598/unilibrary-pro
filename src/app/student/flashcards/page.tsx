import { RoutePage } from "@/components/route-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "AI flashcards",
  description: "Kutubxona yozuvlari asosida flashcard va spaced repetition mock moduli.",
  path: "/student/flashcards"
});

export default function StudentFlashcardsPage() {
  return <RoutePage segments={["student", "flashcards"]} />;
}
