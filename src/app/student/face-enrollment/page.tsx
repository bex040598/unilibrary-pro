import { RoutePage } from "@/components/route-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Face enrollment",
  description: "Consent-based Face ID enrollment, liveness mock va privacy-aware biometric boshqaruv.",
  path: "/student/face-enrollment"
});

export default function StudentFaceEnrollmentPage() {
  return <RoutePage segments={["student", "face-enrollment"]} />;
}
