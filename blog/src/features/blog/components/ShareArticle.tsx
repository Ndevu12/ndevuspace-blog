"use client";

import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Facebook, Twitter, Linkedin, Link2, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareArticleProps {
  title: string;
  url: string;
  className?: string;
  inline?: boolean;
}

export function ShareArticle({
  title,
  url,
  className = "",
  inline = false,
}: ShareArticleProps) {
  const [copied, setCopied] = useState(false);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  };

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
    <div
      className={
        inline
          ? className
          : `bg-card rounded-xl p-6 ${className}`
      }
    >
      <h3 className="font-bold mb-4 flex items-center">
        {!inline && (
          <span className="inline-block w-1 h-8 bg-primary rounded-sm mr-2" />
        )}
        Share This Article
      </h3>

      <div className="flex gap-3">
        <Tooltip>
          <TooltipTrigger
            render={
              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on Facebook"
                className="inline-flex items-center justify-center rounded-full h-12 w-12 bg-[#1877F2] text-white hover:bg-[#1877F2]/80 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
            }
          />
          <TooltipContent>Share on Facebook</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on Twitter"
                className="inline-flex items-center justify-center rounded-full h-12 w-12 bg-[#1DA1F2] text-white hover:bg-[#1DA1F2]/80 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            }
          />
          <TooltipContent>Share on Twitter</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <a
                href={shareLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on LinkedIn"
                className="inline-flex items-center justify-center rounded-full h-12 w-12 bg-[#0A66C2] text-white hover:bg-[#0A66C2]/80 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            }
          />
          <TooltipContent>Share on LinkedIn</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <button
                onClick={handleCopyLink}
                aria-label="Copy link to clipboard"
                className="inline-flex items-center justify-center rounded-full h-12 w-12 border border-border bg-card text-foreground hover:bg-muted transition-colors"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Link2 className="h-5 w-5" />
                )}
              </button>
            }
          />
          <TooltipContent>
            {copied ? "Copied!" : "Copy link"}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
