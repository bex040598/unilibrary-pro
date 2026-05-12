import type { MetadataRoute } from "next";

import { createSeedData } from "@/data/seed";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const data = createSeedData();
  const rootFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly";
  const pageFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "daily";
  const staticRoutes = [
    "",
    "/catalog",
    "/repository",
    "/login",
    "/register",
    "/student/ai-assistant",
    "/student/recommendations",
    "/student/reading-plans",
    "/student/ai-quiz",
    "/student/flashcards",
    "/student/bibliography",
    "/student/research-explorer",
    "/new-arrivals",
    "/popular-books",
    "/about",
    "/rules",
    "/contact"
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" ? rootFrequency : pageFrequency,
      priority: route === "" ? 1 : 0.8
    })),
    ...data.records.slice(0, 40).map((record) => ({
      url: `${siteUrl}/catalog/${record.id}`,
      lastModified: new Date(record.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7
    })),
    ...data.digitalResources.slice(0, 40).map((resource) => ({
      url: `${siteUrl}/repository/${resource.id}`,
      lastModified: new Date(resource.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.7
    }))
  ];
}
