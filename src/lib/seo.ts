import type { Metadata } from "next";

const siteName = "UniLibrary Pro";
export const siteUrl =
  process.env.URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://unilibrary-pro-1.onrender.com";

export function buildMetadata(args: {
  title: string;
  description: string;
  path?: string;
}) {
  const url = `${siteUrl}${args.path ?? ""}`;
  const fullTitle = `${args.title} | ${siteName}`;

  return {
    title: fullTitle,
    description: args.description,
    openGraph: {
      title: fullTitle,
      description: args.description,
      url,
      siteName,
      locale: "uz_UZ",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: args.description
    },
    alternates: {
      canonical: url
    }
  } satisfies Metadata;
}

export function buildSectionMetadata(args: {
  defaultTitle: string;
  description: string;
}) {
  return {
    title: {
      default: `${args.defaultTitle} | ${siteName}`,
      template: `%s | ${args.defaultTitle} | ${siteName}`
    },
    description: args.description,
    openGraph: {
      title: `${args.defaultTitle} | ${siteName}`,
      description: args.description,
      siteName,
      locale: "uz_UZ",
      type: "website"
    }
  } satisfies Metadata;
}

export const seoRouteMap = {
  home: {
    title: "Universitet Elektron Kutubxonasi",
    description:
      "Universitet kutubxonasi uchun elektron katalog, circulation, repository, reading room booking va analytics tizimi."
  },
  catalog: {
    title: "Elektron katalog",
    description:
      "Bibliografik yozuvlar, inventar raqami, subject heading, UDK/BBK/DDC va copy availability bo'yicha qidiruv."
  },
  repository: {
    title: "Raqamli repository",
    description:
      "Elektron kitoblar, maqolalar, thesis va metodik qo'llanmalar uchun universitet repository moduli."
  },
  login: {
    title: "Kabinetga kirish",
    description:
      "Student, teacher, librarian, cataloger, acquisition, repository manager va admin rollari uchun kirish sahifasi."
  }
} as const;
