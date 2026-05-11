import { BibliographicRecord } from "@/types";

export function buildCitation(record: BibliographicRecord) {
  return `${record.authors.join(", ")}. ${record.title}${
    record.subtitle ? `: ${record.subtitle}` : ""
  }. ${record.publisher}, ${record.publicationYear}. ISBN ${record.isbn}.`;
}
