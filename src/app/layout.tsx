import type { Metadata } from "next";

import "@/app/globals.css";
import { AppProviders } from "@/components/app-providers";
import { ToastProvider } from "@/components/ui/toast";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Universitet Elektron Kutubxonasi",
  description:
    "UniLibrary Pro universitet kutubxonasi uchun OPAC katalog, circulation, repository, reading room booking, acquisition va analytics platformasi.",
  path: "/"
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>
        <ToastProvider>
          <AppProviders>{children}</AppProviders>
        </ToastProvider>
      </body>
    </html>
  );
}
