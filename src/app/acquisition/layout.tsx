import type { Metadata } from "next";

import { buildSectionMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSectionMetadata({
  defaultTitle: "Acquisition moduli",
  description:
    "Purchase requests, vendors, orders va budget dashboard uchun acquisition management bo'limi."
});

export default function AcquisitionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
