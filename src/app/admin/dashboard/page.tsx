import { RoutePage } from "@/components/route-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Admin dashboard",
  description: "Users, collection growth, fines, audit logs va AI analytics bo'yicha markaziy nazorat paneli.",
  path: "/admin/dashboard"
});

export default function AdminDashboardPage() {
  return <RoutePage segments={["admin", "dashboard"]} />;
}
