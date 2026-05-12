import { RoutePage } from "@/components/route-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy center",
  description: "Biometric consent, identity methods, audit history va data control markazi.",
  path: "/student/privacy-center"
});

export default function StudentPrivacyCenterPage() {
  return <RoutePage segments={["student", "privacy-center"]} />;
}
