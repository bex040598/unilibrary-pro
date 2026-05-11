import type { Metadata } from "next";

import { buildSectionMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSectionMetadata({
  defaultTitle: "Repository manager",
  description:
    "Repository uploads, access policy va digital resource registry uchun boshqaruv bo'limi."
});

export default function RepositoryManagerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
