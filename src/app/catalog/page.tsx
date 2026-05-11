import { RoutePage } from "@/components/route-page";
import { buildMetadata, seoRouteMap } from "@/lib/seo";

export const metadata = buildMetadata({
  title: seoRouteMap.catalog.title,
  description: seoRouteMap.catalog.description,
  path: "/catalog"
});

export default function CatalogPage() {
  return <RoutePage segments={["catalog"]} />;
}
