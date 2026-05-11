import { RoutePage } from "@/components/route-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "My bibliography",
  description: "APA, MLA, Chicago, GOST-like va O'zbek ilmiy formatlari uchun bibliografiya boshqaruvi.",
  path: "/student/bibliography"
});

export default function StudentBibliographyPage() {
  return <RoutePage segments={["student", "bibliography"]} />;
}
