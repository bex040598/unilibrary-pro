import type { Metadata } from "next";

import { buildSectionMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSectionMetadata({
  defaultTitle: "Teacher kabineti",
  description: "O'qituvchilar uchun reading lists, repository submissions va academic resource management moduli."
});

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return children;
}
