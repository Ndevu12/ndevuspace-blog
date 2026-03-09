import type { Metadata } from "next";
import "../styles/globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "NdevuSpace | Full Stack Developer Portfolio",
  description:
    "NdevuSpace - Full Stack Developer Portfolio showcasing innovative web solutions, projects and technical expertise",
  keywords: [
    "Full Stack Developer",
    "Portfolio",
    "Web Development",
    "React",
    "Next.js",
    "TypeScript",
  ],
  authors: [{ name: "Ndevu" }],
  creator: "Ndevu",
  metadataBase: new URL("https://ndevuspace.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ndevuspace.com",
    siteName: "NdevuSpace",
    title: "NdevuSpace | Full Stack Developer Portfolio",
    description:
      "Full Stack Developer Portfolio showcasing innovative web solutions, projects and technical expertise",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "NdevuSpace Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ndevu",
    creator: "@ndevu",
    title: "NdevuSpace | Full Stack Developer Portfolio",
    description:
      "Full Stack Developer Portfolio showcasing innovative web solutions, projects and technical expertise",
    images: ["/images/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-site-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link rel="dns-prefetch" href="//cdnjs.cloudflare.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>
      <body
        className="bg-white dark:bg-primary text-gray-900 dark:text-white font-roboto min-h-screen antialiased transition-colors duration-300"
        suppressHydrationWarning={true}
      >
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
