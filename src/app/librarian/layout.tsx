import type { Metadata } from "next";

import { buildSectionMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSectionMetadata({
  defaultTitle: "Librarian desk",
  description:
    "Issue, return, renew, reservation approval va reading room check-in jarayonlari uchun librarian workspace."
});

export default function LibrarianLayout({ children }: { children: React.ReactNode }) {
  return children;
}
