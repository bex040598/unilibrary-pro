import { RoutePage } from "@/components/route-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "AI quiz generator",
  description: "Katalog va repository metadata asosida test savollari yaratish va natijalarni saqlash moduli.",
  path: "/student/ai-quiz"
});

export default function StudentAIQuizPage() {
  return <RoutePage segments={["student", "ai-quiz"]} />;
}
