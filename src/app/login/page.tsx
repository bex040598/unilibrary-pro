import { RoutePage } from "@/components/route-page";
import { buildMetadata, seoRouteMap } from "@/lib/seo";

export const metadata = buildMetadata({
  title: seoRouteMap.login.title,
  description: seoRouteMap.login.description,
  path: "/login"
});

export default function LoginPage() {
  return <RoutePage segments={["login"]} />;
}
