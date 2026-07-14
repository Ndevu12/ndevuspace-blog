import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PORTFOLIO_URL, SOCIAL_LINKS } from "@/lib/constants";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-2">
            <Link href="/blog" className="font-bold text-lg">
              <span className="text-primary">ndevuspace</span>{" "}
              <span className="text-muted-foreground font-normal text-sm">
                blog
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Articles on software engineering, web development, and technology.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-foreground">
              Quick Links
            </h3>
            <nav className="flex flex-col gap-1">
              <Link
                href="/blog"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
              </Link>
              <a
                href={PORTFOLIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Portfolio
              </a>
            </nav>
          </div>

          {/* Socials */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-foreground">Connect</h3>
            <div className="flex gap-3">
              <a
                href={SOCIAL_LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href={`mailto:${SOCIAL_LINKS.email}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <p className="text-center text-xs text-muted-foreground">
          &copy; {year} ndevuspace. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
