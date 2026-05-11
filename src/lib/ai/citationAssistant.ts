import { BibliographicRecord, CitationStyle } from "@/types";

export function getMissingMetadata(record: BibliographicRecord) {
  return [
    !record.authors.length ? "author" : null,
    !record.publicationYear ? "year" : null,
    !record.publisher ? "publisher" : null,
    !record.publicationPlace ? "place" : null,
    !record.isbn ? "ISBN" : null,
    !record.pages ? "pages" : null
  ].filter(Boolean) as string[];
}

export function buildStyledCitation(record: BibliographicRecord, style: CitationStyle) {
  const authorText = record.authors.join(", ");
  switch (style) {
    case "APA 7":
      return `${authorText} (${record.publicationYear}). ${record.title}${record.subtitle ? `: ${record.subtitle}` : ""}. ${record.publisher}.`;
    case "MLA":
      return `${authorText}. ${record.title}${record.subtitle ? `: ${record.subtitle}` : ""}. ${record.publisher}, ${record.publicationYear}.`;
    case "Chicago":
      return `${authorText}. ${record.title}${record.subtitle ? `: ${record.subtitle}` : ""}. ${record.publicationPlace}: ${record.publisher}, ${record.publicationYear}.`;
    case "GOST-like":
      return `${authorText}. ${record.title}: ${record.subtitle || record.description}. ${record.publicationPlace}: ${record.publisher}, ${record.publicationYear}. ${record.pages} b.`;
    case "Uzbek scientific":
      return `${authorText}. ${record.title}. ${record.publicationPlace}: ${record.publisher}, ${record.publicationYear}. ${record.pages} bet.`;
    default:
      return `${authorText}. ${record.title}.`;
  }
}

export function buildBibliographyExport(citations: string[]) {
  return citations.map((citation, index) => `${index + 1}. ${citation}`).join("\n");
}

export function buildDublinCoreXml(record: BibliographicRecord) {
  const fields = record.dublinCore
    .map((field) => `  <${field.key}>${escapeXml(field.value)}</${field.key}>`)
    .join("\n");
  return `<oai_dc:dc xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" xmlns:dc="http://purl.org/dc/elements/1.1/">\n${fields}\n</oai_dc:dc>`;
}

export function buildMarcExport(record: BibliographicRecord) {
  return [
    `=LDR  ${record.marcFields.find((field) => field.tag === "LDR")?.value ?? "00000nam a2200000 i 4500"}`,
    ...record.marcFields.map((field) => `=${field.tag}  ${field.value}`)
  ].join("\n");
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
