import type { MetadataRoute } from "next";

import { createSeedData } from "@/data/seed";

export default function sitemap(): MetadataRoute.Sitemap {
  const data = createSeedData();
  const baseUrl = "https://unilibrary-platformasi-bex040598.onrender.com";
  const rootFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly";
  const pageFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "daily";
  const staticRoutes = [
    "",
    "/catalog",
    "/repository",
    "/login",
    "/register",
    "/new-arrivals",
    "/popular-books",
    "/about",
    "/rules",
    "/contact"
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" ? rootFrequency : pageFrequency,
      priority: route === "" ? 1 : 0.8
    })),
    ...data.records.slice(0, 40).map((record) => ({
      url: `${baseUrl}/catalog/${record.id}`,
      lastModified: new Date(record.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7
    })),
    ...data.digitalResources.slice(0, 40).map((resource) => ({
      url: `${baseUrl}/repository/${resource.id}`,
      lastModified: new Date(resource.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.7
    }))
  ];
}
