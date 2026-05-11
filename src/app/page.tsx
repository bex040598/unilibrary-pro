import { RoutePage } from "@/components/route-page";
import { buildMetadata, seoRouteMap } from "@/lib/seo";

export const metadata = buildMetadata({
  title: seoRouteMap.home.title,
  description: seoRouteMap.home.description,
  path: "/"
});

export default function HomePage() {
  return <RoutePage segments={[]} />;
}
