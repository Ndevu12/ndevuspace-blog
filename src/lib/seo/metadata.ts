import type { Metadata } from "next";
import { siteConfig } from "@/lib/seo/seo";

export const homeMetadata: Metadata = {
  title: `${siteConfig.name} — Software Engineering & Web Development`,
  description: `Articles on software engineering, web development, and technology by ${siteConfig.author.name}.`,
  openGraph: {
    title: siteConfig.name,
    description:
      "Articles on software engineering, web development, and technology.",
    url: "/blog",
    type: "website",
  },
};
