import { RoutePage } from "@/components/route-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Acquisition dashboard",
  description: "Purchase requests, vendor performance va budget consumption bo'yicha acquisition monitoring.",
  path: "/acquisition/dashboard"
});

export default function AcquisitionDashboardPage() {
  return <RoutePage segments={["acquisition", "dashboard"]} />;
}
