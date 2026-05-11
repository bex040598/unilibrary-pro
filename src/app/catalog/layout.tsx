import type { Metadata } from "next";

import { buildSectionMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSectionMetadata({
  defaultTitle: "Elektron katalog",
  description:
    "Bibliografik yozuvlar, holdings va electronic access bo'yicha universitet OPAC qidiruvi."
});

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
