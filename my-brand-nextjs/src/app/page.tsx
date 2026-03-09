import { Metadata } from "next";
import { HomePage } from "@/features/home";

export const metadata: Metadata = {
  title: "NdevuSpace | Crafting Digital Experiences That Matter",
  description:
    "Welcome to my digital portfolio where code meets creativity. I specialize in building robust, scalable applications that deliver exceptional user experiences.",
  openGraph: {
    title: "NdevuSpace | Crafting Digital Experiences That Matter",
    description:
      "Welcome to my digital portfolio where code meets creativity. Full Stack Developer specializing in robust, scalable applications.",
    url: "/",
    siteName: "NdevuSpace",
    images: [
      {
        url: "/images/hero-image.png",
        width: 1200,
        height: 630,
        alt: "Ndevu - Full Stack Developer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function Home() {
  return <HomePage />;
}
