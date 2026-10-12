import type { MetadataRoute } from "next";
import { SITE_URL } from "@/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/studio`, lastModified, changeFrequency: "monthly", priority: 0.7 },
  ];
}
