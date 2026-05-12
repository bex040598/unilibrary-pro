import { RoutePage } from "@/components/route-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Identity check desk",
  description: "QR student card, Face ID verification va manual fallback orqali librarian identity tekshiruvi.",
  path: "/librarian/identity-check"
});

export default function LibrarianIdentityCheckPage() {
  return <RoutePage segments={["librarian", "identity-check"]} />;
}
