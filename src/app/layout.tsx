import type { Metadata } from "next";

import "@/app/globals.css";
import { AppProviders } from "@/components/app-providers";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "Universitet Elektron Kutubxonasi",
  description: "UniLibrary Pro university electronic library management platform demo"
};

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
