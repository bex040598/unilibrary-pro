import Link from "next/link";

import { Button, Card } from "@/components/ui/primitives";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Ruxsat yo'q",
  description: "Tanlangan bo'lim uchun foydalanuvchi roli yetarli emas.",
  path: "/unauthorized"
});

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 lg:px-8">
      <Card className="text-center">
        <h1 className="text-3xl font-semibold text-ink">Ruxsat yetarli emas</h1>
        <p className="mt-4 text-sm text-slate-600">
          Ushbu modul kutubxona tizimida boshqa rol uchun mo&apos;ljallangan. Iltimos, o&apos;zingizga tegishli kabinetga qayting.
        </p>
        <div className="mt-8 flex justify-center">
          <Link href="/login">
            <Button>Kirish sahifasiga qaytish</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
