import { RoutePage } from "@/components/route-page";
import { createSeedData } from "@/data/seed";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata({
  params
}: {
  params: { id: string };
}) {
  const resource = createSeedData().digitalResources.find((item) => item.id === params.id);
  return buildMetadata({
    title: resource ? `${resource.title} elektron resursi` : "Elektron resurs",
    description:
      resource?.abstract ??
      "Universitet repository resursi, access policy va citation imkoniyatlari bilan.",
    path: `/repository/${params.id}`
  });
}

export default function RepositoryDetailPage({
  params
}: {
  params: { id: string };
}) {
  return <RoutePage segments={["repository", params.id]} />;
}
