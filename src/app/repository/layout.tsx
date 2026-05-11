import type { Metadata } from "next";

import { buildSectionMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSectionMetadata({
  defaultTitle: "Raqamli repository",
  description:
    "Universitet elektron resurslari, thesis, article va e-booklar uchun repository bo'limi."
});

export default function RepositoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
