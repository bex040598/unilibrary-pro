import { RoutePage } from "@/components/route-page";
import { createSeedData } from "@/data/seed";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata({
  params
}: {
  params: { id: string };
}) {
  const record = createSeedData().records.find((item) => item.id === params.id);
  return buildMetadata({
    title: record ? `${record.title} bibliografik yozuvi` : "Bibliografik yozuv",
    description:
      record?.annotation ??
      "Universitet OPAC katalogidagi bibliografik yozuv, copy availability va metadata tafsilotlari.",
    path: `/catalog/${params.id}`
  });
}

export default function CatalogDetailPage({
  params
}: {
  params: { id: string };
}) {
  return <RoutePage segments={["catalog", params.id]} />;
}
