import { RoutePage } from "@/components/route-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Biometric audit",
  description: "Enrollment, Face ID login, QR regeneration va identity risk audit ko'rsatkichlari.",
  path: "/admin/biometric-audit"
});

export default function AdminBiometricAuditPage() {
  return <RoutePage segments={["admin", "biometric-audit"]} />;
}
