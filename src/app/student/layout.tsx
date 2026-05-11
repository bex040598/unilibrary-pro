import type { Metadata } from "next";

import { buildSectionMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSectionMetadata({
  defaultTitle: "Student kabineti",
  description:
    "Talabalar uchun borrowed books, reservations, fines, reading room, AI assistant va learning analytics bo'limi."
});

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
