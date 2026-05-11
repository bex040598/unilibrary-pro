import { RoutePage } from "@/components/route-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Research topic explorer",
  description: "Mavzu bo'yicha resurslar, keywords, research questions va IMRAD outline ko'rsatadigan explorer moduli.",
  path: "/student/research-explorer"
});

export default function StudentResearchExplorerPage() {
  return <RoutePage segments={["student", "research-explorer"]} />;
}
