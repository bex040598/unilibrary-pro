import { RoutePage } from "@/components/route-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Aloqa",
  description: "Universitet kutubxonasi aloqa ma'lumotlari va axborot xizmati kanallari.",
  path: "/contact"
});

export default function ContactPage() {
  return <RoutePage segments={["contact"]} />;
}
