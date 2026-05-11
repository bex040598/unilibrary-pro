import type { Metadata } from "next";

import { buildSectionMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSectionMetadata({
  defaultTitle: "Cataloger paneli",
  description:
    "MARC-like metadata, Dublin Core, authority headings va copy registry uchun cataloging workspace."
});

export default function CatalogerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
