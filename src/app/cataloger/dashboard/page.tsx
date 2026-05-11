import { RoutePage } from "@/components/route-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Cataloger dashboard",
  description: "Draft records, metadata completeness, authority control va copy registry bo'yicha cataloger paneli.",
  path: "/cataloger/dashboard"
});

export default function CatalogerDashboardPage() {
  return <RoutePage segments={["cataloger", "dashboard"]} />;
}
