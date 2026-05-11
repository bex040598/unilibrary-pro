"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge, Button, Card, Input } from "@/components/ui/primitives";

export function PdfPreviewMock({
  title,
  watermark = "UniLibrary Pro"
}: {
  title: string;
  watermark?: string;
}) {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const pages = 12;

  const summary = useMemo(
    () =>
      query
        ? `Search mock found 3 matches for “${query}” in annotation, subject headings, and bibliography note.`
        : "Search within document indexes annotation, keywords, and chapter labels in this preview mock.",
    [query]
  );

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="text-xs text-slate-500">PDF preview mock with access watermark</p>
        </div>
        <Badge tone="gold">Page {page} / {pages}</Badge>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[260px] flex-1">
            <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-10" placeholder="Search within document mock" />
          </div>
          <Button variant="secondary" onClick={() => setPage((current) => Math.max(1, current - 1))}>
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>
          <Button variant="secondary" onClick={() => setPage((current) => Math.min(pages, current + 1))}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative mx-auto min-h-[420px] max-w-2xl rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f8_100%)] px-10 py-10">
          <div className="absolute right-8 top-8 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            Watermark: {watermark}
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="h-3 w-40 rounded-full bg-slate-200" />
              <div className="h-4 w-3/4 rounded-full bg-slate-300" />
            </div>
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="h-3 rounded-full bg-slate-200" style={{ width: `${95 - (index % 3) * 14}%` }} />
            ))}
          </div>
        </div>
        <p className="text-sm text-slate-600">{summary}</p>
      </div>
    </Card>
  );
}
