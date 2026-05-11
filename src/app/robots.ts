import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/catalog", "/repository", "/about", "/rules", "/contact"],
      disallow: ["/admin", "/student", "/librarian", "/cataloger", "/acquisition", "/repository-manager"]
    },
    sitemap: "https://unilibrary-platformasi-bex040598.onrender.com/sitemap.xml"
  };
}
