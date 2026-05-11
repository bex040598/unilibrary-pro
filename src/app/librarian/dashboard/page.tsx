import { RoutePage } from "@/components/route-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Librarian dashboard",
  description: "Issue, return, reservations, overdues va reading room nazorati uchun circulation dashboard.",
  path: "/librarian/dashboard"
});

export default function LibrarianDashboardPage() {
  return <RoutePage segments={["librarian", "dashboard"]} />;
}
