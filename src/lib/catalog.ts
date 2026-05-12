import { AppState, BibliographicRecord, DigitalResource } from "@/types";

export type AvailabilityLabel =
  | "available"
  | "borrowed"
  | "reserved"
  | "reading room only"
  | "digital only";

export function getMetadataWarnings(record: BibliographicRecord) {
  const warnings: string[] = [];
  if (!record.authors.length || !record.authors[0]?.trim()) warnings.push("Muallif ko'rsatilmagan");
  if (!record.isbn.trim()) warnings.push("ISBN maydoni to'ldirilmagan");
  if (!record.subjects.length || !record.subjects[0]?.trim()) warnings.push("Subject heading yetishmaydi");
  if (!record.publisher.trim()) warnings.push("Nashriyot ko'rsatilmagan");
  if (!record.udc.trim() || !record.bbk.trim() || !record.ddc.trim()) warnings.push("Klassifikatsiya kodlari to'liq emas");
  return warnings;
}

export function getMetadataCompleteness(record: BibliographicRecord) {
  const missing = getMetadataWarnings(record).length;
  const score = [100, 93, 81, 74, 62][Math.min(missing, 4)];
  return {
    score,
    warnings: getMetadataWarnings(record),
    tone: score >= 93 ? ("emerald" as const) : score >= 81 ? ("cyan" as const) : score >= 74 ? ("gold" as const) : ("orange" as const)
  };
}

export function getAvailabilitySummary(state: AppState, recordId: string) {
  const copies = state.copies.filter((copy) => copy.recordId === recordId);
  const digitalResource = state.digitalResources.find((resource) => resource.recordId === recordId);
  const available = copies.filter((copy) => copy.status === "available").length;
  const borrowed = copies.filter((copy) => copy.status === "borrowed").length;
  const reserved = copies.filter((copy) => copy.status === "reserved").length;
  const readingRoomOnly = copies.length > 0 && copies.every((copy) => Boolean(copy.roomId));

  let label: AvailabilityLabel = "available";
  if (copies.length === 0 && digitalResource) {
    label = "digital only";
  } else if (readingRoomOnly) {
    label = "reading room only";
  } else if (available > 0) {
    label = "available";
  } else if (reserved > 0) {
    label = "reserved";
  } else {
    label = "borrowed";
  }

  return {
    total: copies.length,
    available,
    borrowed,
    reserved,
    label,
    hasDigital: Boolean(digitalResource),
    copies
  };
}

export function explainCatalogMatch(record: BibliographicRecord, query: string, resource?: DigitalResource) {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) {
    return "Natija fakultet, circulation va katalog relevanti bo'yicha tartiblandi.";
  }

  if (`${record.title} ${record.subtitle}`.toLocaleLowerCase().includes(normalized)) {
    return "Sarlavha yoki subtitlda qidiruv iborasi topildi.";
  }
  if (record.authors.join(" ").toLocaleLowerCase().includes(normalized)) {
    return "Muallif maydoni qidiruv so'roviga mos keldi.";
  }
  if (record.subjects.join(" ").toLocaleLowerCase().includes(normalized)) {
    return "Subject heading va kalit so'zlar bo'yicha moslik topildi.";
  }
  if (`${record.udc} ${record.bbk} ${record.ddc}`.toLocaleLowerCase().includes(normalized)) {
    return "Klassifikatsiya kodlari qidiruv so'rovi bilan bog'landi.";
  }
  if (resource) {
    return "Bog'langan elektron resurs annotatsiyasi va metadata signallari hisobga olindi.";
  }
  return "Annotatsiya, kalit so'zlar va fakultet konteksti bo'yicha tavsiya qilindi.";
}
