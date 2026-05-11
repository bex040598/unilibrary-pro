import { RoutePage } from "@/components/route-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "AI kutubxona yordamchisi",
  description: "Kutubxona fondi va repository asosida ishlaydigan akademik AI assistant paneli.",
  path: "/student/ai-assistant"
});

export default function StudentAIAssistantPage() {
  return <RoutePage segments={["student", "ai-assistant"]} />;
}
