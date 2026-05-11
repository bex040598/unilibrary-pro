import { RoutePage } from "@/components/route-page";
import { buildMetadata, seoRouteMap } from "@/lib/seo";

export const metadata = buildMetadata({
  title: seoRouteMap.repository.title,
  description: seoRouteMap.repository.description,
  path: "/repository"
});

export default function RepositoryPage() {
  return <RoutePage segments={["repository"]} />;
}
