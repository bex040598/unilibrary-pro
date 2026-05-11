import { RoutePage } from "@/components/route-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Tizim haqida",
  description: "UniLibrary Pro arxitekturasi, library workflows va metadata standards tayyorgarligi haqida sahifa.",
  path: "/about"
});

export default function AboutPage() {
  return <RoutePage segments={["about"]} />;
}
