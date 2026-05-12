import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/catalog", "/repository", "/about", "/rules", "/contact"],
      disallow: ["/admin", "/student", "/librarian", "/cataloger", "/acquisition", "/repository-manager"]
    },
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
