import type { MetadataRoute } from "next";
import { SITE } from "@/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: "RAG Engine",
    description: SITE.shortDescription,
    start_url: "/",
    display: "standalone",
    background_color: SITE.colors.paper,
    theme_color: SITE.colors.aubergine,
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
