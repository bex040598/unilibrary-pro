import { RoutePage } from "@/components/route-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Yangi kelgan adabiyotlar",
  description: "Katalogga yaqinda qo'shilgan bibliografik yozuvlar va yangi holdings ro'yxati.",
  path: "/new-arrivals"
});

export default function NewArrivalsPage() {
  return <RoutePage segments={["new-arrivals"]} />;
}
