import type { Metadata } from "next";

import { buildSectionMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSectionMetadata({
  defaultTitle: "Admin dashboard",
  description:
    "Users, fines, audit logs, AI analytics va system settings bo'yicha markaziy nazorat paneli."
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
