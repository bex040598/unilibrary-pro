import { RoutePage } from "@/components/route-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "AI reading plans",
  description: "Talaba uchun mavzu, daraja va muddat asosida yaratiladigan kunlik o'qish rejalari.",
  path: "/student/reading-plans"
});

export default function StudentReadingPlansPage() {
  return <RoutePage segments={["student", "reading-plans"]} />;
}
