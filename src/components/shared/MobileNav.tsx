"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface MobileNavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  /** Sheet heading. */
  title: string;
  description?: string;
  /**
   * Sheet body. Receives a `close` callback so interactive content (a
   * category tap, a tag) can dismiss the sheet after acting.
   */
  content: React.ReactNode | ((close: () => void) => React.ReactNode);
  /** Optional count/dot shown on the trigger. */
  badge?: React.ReactNode;
}

interface MobileNavProps {
  items: MobileNavItem[];
  className?: string;
}

/**
 * Fixed bottom navigation bar (mobile only) that houses secondary
 * navigation in bottom sheets — one open at a time. Desktop uses the
 * sidebar instead, so this is hidden from `lg` up.
 */
export function MobileNav({ items, className }: MobileNavProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const close = () => setOpenKey(null);
  const active = items.find((item) => item.key === openKey) ?? null;

  return (
    <>
      <nav
        aria-label="Browse"
        className={cn(
          "glass fixed inset-x-0 bottom-0 z-40 flex divide-x divide-border/60 border-t border-border/60 pb-[env(safe-area-inset-bottom)] lg:hidden",
          className
        )}
      >
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setOpenKey(item.key)}
            className="pressable relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-muted-foreground transition-colors duration-200 hover:text-primary"
          >
            <span className="[&_svg]:h-5 [&_svg]:w-5">{item.icon}</span>
            <span className="text-[11px] font-medium">{item.label}</span>
            {item.badge != null && (
              <span className="absolute right-[22%] top-1.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold leading-4 text-primary-foreground">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <Sheet open={active !== null} onOpenChange={(next) => !next && close()}>
        <SheetContent
          side="bottom"
          showCloseButton
          className="max-h-[75vh] rounded-t-2xl"
        >
          {active && (
            <>
              <SheetHeader>
                <SheetTitle className="text-eyebrow">{active.title}</SheetTitle>
                {active.description && (
                  <SheetDescription>{active.description}</SheetDescription>
                )}
              </SheetHeader>
              <div className="overflow-y-auto px-4 pb-8">
                {typeof active.content === "function"
                  ? active.content(close)
                  : active.content}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
