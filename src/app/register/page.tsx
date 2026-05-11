import { RoutePage } from "@/components/route-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Ro'yxatdan o'tish",
  description: "Talaba yoki o'qituvchi sifatida demo kabinet yaratish sahifasi.",
  path: "/register"
});

export default function RegisterPage() {
  return <RoutePage segments={["register"]} />;
}
