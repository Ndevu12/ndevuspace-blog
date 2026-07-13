"use client";

import { useState } from "react";
import { List } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TableOfContents } from "./TableOfContents";

/**
 * Floating, always-reachable table-of-contents trigger pinned top-left on
 * mobile article pages. Opens the TOC (bare, no card chrome) in a bottom
 * sheet. Desktop uses the sticky sidebar TOC instead, so this hides at `lg`.
 */
export function MobileTocButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Table of contents"
        className="pressable fixed left-4 top-20 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-sm backdrop-blur-md transition-colors duration-200 hover:border-primary hover:text-primary lg:hidden"
      >
        <List className="h-5 w-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          showCloseButton
          className="max-h-[75vh] rounded-t-2xl"
        >
          <SheetHeader>
            <SheetTitle className="text-eyebrow">On this page</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto px-4 pb-8">
            <TableOfContents
              presentation="bare"
              onNavigate={() => setOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
