import { RoutePage } from "@/components/route-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Identity security settings",
  description: "Face ID, QR card login, passkey mock va liveness siyosatlari bo'yicha admin boshqaruvi.",
  path: "/admin/security/identity-settings"
});

export default function AdminIdentitySettingsPage() {
  return <RoutePage segments={["admin", "security", "identity-settings"]} />;
}
