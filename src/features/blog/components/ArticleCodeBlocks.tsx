"use client";

import { useEffect } from "react";
import { toast } from "sonner";

// Inline SVGs (lucide Copy / Check) — buttons are created outside React,
// following the article-DOM enhancement pattern set by TableOfContents.
const COPY_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
const CHECK_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

const RESET_DELAY_MS = 2000;

interface ArticleCodeBlocksProps {
  /** Re-runs enhancement when the rendered article changes. */
  contentKey: string;
}

/**
 * Adds a copy button to every `.code-block` produced by
 * highlightCodeBlocks(). Renders nothing itself — the article HTML comes
 * from dangerouslySetInnerHTML, so enhancement happens on the live DOM.
 * Like TableOfContents, it re-runs via MutationObserver because article
 * HTML can be replaced/hydrated after mount.
 */
export function ArticleCodeBlocks({ contentKey }: ArticleCodeBlocksProps) {
  useEffect(() => {
    const article = document.querySelector("[data-article-content]");
    if (!article) return;

    const cleanups = new Map<HTMLButtonElement, () => void>();

    const enhance = () => {
      article.querySelectorAll<HTMLElement>(".code-block").forEach((block) => {
        if (block.querySelector(".code-copy")) return;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "code-copy";
        button.setAttribute("aria-label", "Copy code");
        button.innerHTML = COPY_ICON;

        let resetTimer: number | undefined;
        const onClick = async () => {
          const code = block.querySelector("pre")?.textContent ?? "";
          try {
            await navigator.clipboard.writeText(code);
            button.innerHTML = CHECK_ICON;
            button.classList.add("copied");
            window.clearTimeout(resetTimer);
            resetTimer = window.setTimeout(() => {
              button.innerHTML = COPY_ICON;
              button.classList.remove("copied");
            }, RESET_DELAY_MS);
          } catch {
            toast.error("Failed to copy code");
          }
        };

        button.addEventListener("click", onClick);
        block.appendChild(button);
        cleanups.set(button, () => {
          window.clearTimeout(resetTimer);
          button.removeEventListener("click", onClick);
          button.remove();
        });
      });
    };

    enhance();

    // Coalesce clustered mutations into one enhancement pass per frame.
    let rafId: number | null = null;
    const observer = new MutationObserver(() => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        // Drop cleanups for buttons that mutations removed from the DOM.
        for (const [button, cleanup] of cleanups) {
          if (!button.isConnected) {
            cleanup();
            cleanups.delete(button);
          }
        }
        enhance();
      });
    });
    observer.observe(article, { childList: true, subtree: true });

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      observer.disconnect();
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [contentKey]);

  return null;
}
