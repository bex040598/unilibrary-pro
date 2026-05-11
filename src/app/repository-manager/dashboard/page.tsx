import { RoutePage } from "@/components/route-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Repository manager dashboard",
  description: "Digital resource uploads, access policy va usage metrics bo'yicha repository management paneli.",
  path: "/repository-manager/dashboard"
});

export default function RepositoryManagerDashboardPage() {
  return <RoutePage segments={["repository-manager", "dashboard"]} />;
}
