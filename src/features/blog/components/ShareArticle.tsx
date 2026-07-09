"use client";

import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Facebook, Twitter, Linkedin, Link2, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ShareArticleProps {
  title: string;
  url: string;
  className?: string;
}

const shareButtonClasses =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-200 hover:border-primary hover:bg-primary/10 hover:text-primary";

export function ShareArticle({ title, url, className }: ShareArticleProps) {
  const [copied, setCopied] = useState(false);

  const shareLinks = [
    {
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      Icon: Facebook,
    },
    {
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      Icon: Twitter,
    },
    {
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      Icon: Linkedin,
    },
  ] as const;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <h3 className="text-eyebrow">Share this article</h3>
      <div className="flex gap-2.5">
        {shareLinks.map(({ label, href, Icon }) => (
          <Tooltip key={label}>
            <TooltipTrigger
              render={
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={shareButtonClasses}
                >
                  <Icon className="h-4 w-4" />
                </a>
              }
            />
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}

        <Tooltip>
          <TooltipTrigger
            render={
              <button
                onClick={handleCopyLink}
                aria-label="Copy link to clipboard"
                className={shareButtonClasses}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Link2 className="h-4 w-4" />
                )}
              </button>
            }
          />
          <TooltipContent>{copied ? "Copied!" : "Copy link"}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
