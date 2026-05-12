import { RoutePage } from "@/components/route-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Student identity",
  description: "Digital student card, QR identity, Face ID va passkey boshqaruvi.",
  path: "/student/identity"
});

export default function StudentIdentityPage() {
  return <RoutePage segments={["student", "identity"]} />;
}
