import { RoutePage } from "@/components/route-page";

export default function CatchAllPage({
  params
}: {
  params: { slug?: string[] };
}) {
  return <RoutePage segments={params.slug ?? []} />;
}
