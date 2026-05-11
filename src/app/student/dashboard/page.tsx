import { RoutePage } from "@/components/route-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Student dashboard",
  description: "Borrowed books, fines, AI reading plans, notifications va learning analytics ko'rsatkichlari.",
  path: "/student/dashboard"
});

export default function StudentDashboardPage() {
  return <RoutePage segments={["student", "dashboard"]} />;
}
