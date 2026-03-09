"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { PORTFOLIO_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Blog", href: "/blog" },
  { label: "Categories", href: "/blog?view=categories" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDashboard = pathname.startsWith("/dashboard");

  // Don't render on dashboard pages — they have their own sidebar
  if (isDashboard) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/blog" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-primary">ndevuspace</span>
          <span className="text-muted-foreground font-normal text-sm">
            blog
          </span>
        </Link>

        {/* Desktop nav — using shadcn NavigationMenu */}
        <div className="hidden md:flex items-center gap-2">
          <NavigationMenu>
            <NavigationMenuList>
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink
                    render={<Link href={link.href} />}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "text-muted-foreground hover:text-foreground",
                      (pathname === link.href || pathname === link.href.split("?")[0]) && "text-foreground bg-accent"
                    )}
                  >
                    {link.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}

              <NavigationMenuItem>
                <NavigationMenuLink
                  href={PORTFOLIO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Who am I?
                  <ExternalLink className="ml-1 h-3 w-3" />
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <ThemeToggle />
        </div>

        {/* Mobile nav — using shadcn Sheet */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-2 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-muted-foreground",
                        (pathname === link.href || pathname === link.href.split("?")[0]) && "text-foreground bg-accent"
                      )}
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}

                <a
                  href={PORTFOLIO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                >
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                    Portfolio
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
