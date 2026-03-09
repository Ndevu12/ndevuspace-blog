"use client";

import { useState } from "react";

interface ShareArticleProps {
  title: string;
  url: string;
  className?: string;
  inline?: boolean; // New prop for inline usage
}

export function ShareArticle({
  title,
  url,
  className = "",
  inline = false,
}: ShareArticleProps) {
  const [copied, setCopied] = useState(false);

  const shareData = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title
    )}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      url
    )}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div
      className={
        inline
          ? className
          : `bg-white dark:bg-secondary rounded-xl p-6 ${className}`
      }
    >
      <h3 className="font-bold mb-4 text-gray-900 dark:text-white flex items-center">
        {!inline && (
          <span className="inline-block w-3 h-10 bg-yellow-500 rounded-sm mr-2"></span>
        )}
        Share This Article
      </h3>

      <div className="flex gap-3">
        {/* Facebook */}
        <a
          href={shareData.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center hover:opacity-80 transition-opacity group"
          aria-label="Share on Facebook"
        >
          <i className="fab fa-facebook-f text-white text-lg group-hover:scale-110 transition-transform"></i>
        </a>

        {/* Twitter */}
        <a
          href={shareData.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full bg-[#1DA1F2] flex items-center justify-center hover:opacity-80 transition-opacity group"
          aria-label="Share on Twitter"
        >
          <i className="fab fa-twitter text-white text-lg group-hover:scale-110 transition-transform"></i>
        </a>

        {/* LinkedIn */}
        <a
          href={shareData.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full bg-[#0A66C2] flex items-center justify-center hover:opacity-80 transition-opacity group"
          aria-label="Share on LinkedIn"
        >
          <i className="fab fa-linkedin-in text-white text-lg group-hover:scale-110 transition-transform"></i>
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="w-12 h-12 rounded-full bg-gray-700 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors group"
          title="Copy link to clipboard"
          aria-label="Copy link to clipboard"
        >
          {copied ? (
            <i className="fas fa-check text-green-400 text-lg group-hover:scale-110 transition-transform"></i>
          ) : (
            <i className="fas fa-copy text-white text-lg group-hover:scale-110 transition-transform"></i>
          )}
        </button>
      </div>

      {copied && (
        <div className="mt-3 text-sm text-green-500 dark:text-green-400 font-medium">
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
}
