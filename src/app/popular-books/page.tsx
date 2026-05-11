import { RoutePage } from "@/components/route-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Ko'p o'qilgan kitoblar",
  description: "Circulation statistikasi asosida eng ko'p foydalanilgan kitoblar ro'yxati.",
  path: "/popular-books"
});

export default function PopularBooksPage() {
  return <RoutePage segments={["popular-books"]} />;
}
