import { BibliographicRecord, DigitalResource } from "@/types";

const synonymDictionary: Record<string, string[]> = {
  "suniy intellekt": ["ai", "artificial intelligence", "machine learning", "нейрон", "sun'iy intellekt"],
  "kiberxavfsizlik": ["internet xavfsizligi", "cybersecurity", "axborot xavfsizligi", "tarmoq xavfsizligi"],
  "malumotlar bazasi": ["database", "db", "sql", "ma'lumotlar bazasi"],
  "raqamli talim": ["digital learning", "edtech", "lms", "e-learning"],
  "dasturlash": ["programming", "software", "kodlash", "web development"],
  "kompyuter tarmoqlari": ["network", "internet", "routing", "switching"]
};

function normalize(value: string) {
  return value
    .toLocaleLowerCase()
    .replace(/[`’'"]/g, "")
    .replace(/o‘|o'/g, "o")
    .replace(/g‘|g'/g, "g")
    .replace(/ҳ/g, "h")
    .replace(/[^\p{L}\p{N}\s.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function expandTokens(query: string) {
  const normalized = normalize(query);
  const baseTokens = normalized.split(" ").filter(Boolean);
  const expanded = new Set(baseTokens);

  Object.entries(synonymDictionary).forEach(([concept, aliases]) => {
    const conceptTokens = normalize(concept).split(" ");
    const matchesConcept =
      normalized.includes(normalize(concept)) ||
      aliases.some((alias) => normalized.includes(normalize(alias)));

    if (matchesConcept) {
      conceptTokens.forEach((token) => expanded.add(token));
      aliases
        .flatMap((alias) => normalize(alias).split(" "))
        .filter(Boolean)
        .forEach((token) => expanded.add(token));
    }
  });

  return Array.from(expanded);
}

function scoreText(text: string, tokens: string[]) {
  const normalized = normalize(text);
  return tokens.reduce((score, token) => {
    if (!token) return score;
    if (normalized === token) return score + 14;
    if (normalized.startsWith(token)) return score + 10;
    if (normalized.includes(token)) return score + 6;
    return score;
  }, 0);
}

export function scoreRecord(record: BibliographicRecord, query: string, context?: { faculty?: string; department?: string }) {
  const tokens = expandTokens(query);
  if (!tokens.length) {
    return record.borrowCount;
  }

  const titleScore = scoreText(`${record.title} ${record.subtitle}`, tokens) * 2;
  const authorScore = scoreText(record.authors.join(" "), tokens);
  const keywordScore = scoreText(record.keywords.join(" "), tokens) + scoreText(record.subjects.join(" "), tokens);
  const classificationScore = scoreText(`${record.udc} ${record.bbk} ${record.ddc} ${record.lcc}`, tokens);
  const annotationScore = scoreText(record.annotation, tokens);
  const contextScore =
    scoreText(`${record.faculty} ${record.department}`, tokens) +
    (context?.faculty && normalize(record.faculty) === normalize(context.faculty) ? 8 : 0) +
    (context?.department && normalize(record.department) === normalize(context.department) ? 6 : 0);

  return titleScore + authorScore + keywordScore + classificationScore + annotationScore + contextScore;
}

export function semanticSearchRecords(
  records: BibliographicRecord[],
  query: string,
  context?: { faculty?: string; department?: string; limit?: number }
) {
  const scored = records
    .map((record) => ({ record, score: scoreRecord(record, query, context) }))
    .filter((item) => item.score > 0 || !query.trim())
    .sort((a, b) => b.score - a.score || b.record.borrowCount - a.record.borrowCount);

  return (context?.limit ? scored.slice(0, context.limit) : scored).map((item) => item.record);
}

export function semanticSearchResources(
  resources: DigitalResource[],
  query: string,
  context?: { faculty?: string; department?: string; limit?: number }
) {
  const tokens = expandTokens(query);
  const scored = resources
    .map((resource) => {
      const text = [
        resource.title,
        resource.abstract,
        resource.keywords.join(" "),
        resource.faculty,
        resource.department,
        resource.language,
        resource.type
      ].join(" ");
      const score =
        scoreText(text, tokens) +
        (context?.faculty && normalize(resource.faculty) === normalize(context.faculty) ? 8 : 0) +
        (context?.department && normalize(resource.department) === normalize(context.department) ? 6 : 0);
      return { resource, score };
    })
    .filter((item) => item.score > 0 || !query.trim())
    .sort((a, b) => b.score - a.score || b.resource.downloads - a.resource.downloads);

  return (context?.limit ? scored.slice(0, context.limit) : scored).map((item) => item.resource);
}

export function semanticSearchAll(args: {
  query: string;
  records: BibliographicRecord[];
  resources: DigitalResource[];
  faculty?: string;
  department?: string;
  limit?: number;
}) {
  const records = semanticSearchRecords(args.records, args.query, args);
  const resources = semanticSearchResources(args.resources, args.query, args);

  return {
    records: args.limit ? records.slice(0, args.limit) : records,
    resources: args.limit ? resources.slice(0, args.limit) : resources
  };
}
