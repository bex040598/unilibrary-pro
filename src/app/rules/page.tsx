import { RoutePage } from "@/components/route-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Foydalanish qoidalari",
  description: "Loan, reservation, reading room booking va fine settlement qoidalari.",
  path: "/rules"
});

export default function RulesPage() {
  return <RoutePage segments={["rules"]} />;
}
