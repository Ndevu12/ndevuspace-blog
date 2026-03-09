import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  variant?: "default" | "elevated" | "bordered";
}

const Card: React.FC<CardProps> = ({
  className,
  children,
  hover = true,
  variant = "default",
}) => {
  const variants = {
    default: "bg-secondary shadow-lg",
    elevated: "bg-secondary shadow-xl border border-gray-800/50",
    bordered: "bg-secondary border border-gray-700",
  };

  const hoverClass = hover
    ? "transition-all duration-300 hover:shadow-xl hover:scale-105 group"
    : "";

  return (
    <div
      className={cn("p-6 rounded-lg", variants[variant], hoverClass, className)}
    >
      {children}
    </div>
  );
};

export interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  techStack?: Array<{ name: string; color: string }>;
  caseStudyLink?: string;
  demoLink?: string;
  githubLink?: string;
  className?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  description,
  image,
  techStack = [],
  caseStudyLink,
  demoLink,
  githubLink,
  className,
}) => {
  return (
    <Card className={cn("group", className)}>
      <div className="relative overflow-hidden h-60 mb-6 rounded-lg">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {techStack.length > 0 && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
            <div className="p-4 w-full">
              <div className="flex gap-2 mb-2 flex-wrap">
                {techStack.slice(0, 3).map((tech, index) => (
                  <span
                    key={index}
                    className={cn(
                      "text-xs px-2 py-1 rounded-full text-white",
                      `bg-${tech.color}-600`
                    )}
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
              <h4 className="font-bold text-white text-sm">Tech Stack</h4>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-bold mb-2 text-yellow-400">{title}</h3>
        <p className="text-gray-300 mb-4">{description}</p>

        <div className="flex justify-between items-center mt-4">
          {caseStudyLink && (
            <a
              href={caseStudyLink}
              className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
            >
              View Details
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          )}

          <div className="flex gap-2">
            {demoLink && (
              <a
                href={demoLink}
                className="p-2 rounded-full bg-gray-700/50 text-gray-300 hover:text-yellow-400 hover:bg-gray-700 transition-all"
                title="Live Demo"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
            {githubLink && (
              <a
                href={githubLink}
                className="p-2 rounded-full bg-gray-700/50 text-gray-300 hover:text-yellow-400 hover:bg-gray-700 transition-all"
                title="View Code"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export interface BlogCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags?: Array<string | { name: string; bgClass?: string; textClass?: string }>;
  author: string;
  authorImage?: string;
  date: string | Date;
  isNew?: boolean;
  readTime?: string;
  className?: string;
}

export const BlogCard: React.FC<BlogCardProps> = ({
  id,
  title,
  description,
  imageUrl,
  tags = [],
  author,
  authorImage,
  date,
  isNew = false,
  readTime,
  className,
}) => {
  const formattedDate =
    date instanceof Date
      ? date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

  return (
    <Card className={cn("group", className)}>
      <div className="relative overflow-hidden h-48 mb-4 rounded-lg">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {isNew && (
          <div className="absolute top-3 left-3">
            <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
              NEW
            </span>
          </div>
        )}
        {tags.length > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-2">
            {tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  typeof tag === "object"
                    ? tag.bgClass || "bg-gray-600/80"
                    : "bg-gray-600/80",
                  typeof tag === "object"
                    ? tag.textClass || "text-white"
                    : "text-white"
                )}
              >
                {typeof tag === "string" ? tag : tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mb-3">
        {authorImage && (
          <Image
            src={authorImage}
            alt={author}
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <div className="flex-1">
          <p className="text-sm text-gray-400">{author}</p>
          <p className="text-xs text-gray-500">{formattedDate}</p>
        </div>
        {readTime && <span className="text-xs text-gray-500">{readTime}</span>}
      </div>

      <h3 className="text-lg font-bold mb-2 text-white group-hover:text-yellow-400 transition-colors">
        {title}
      </h3>
      <p className="text-gray-300 text-sm mb-4 line-clamp-3">{description}</p>

      <a
        href={`/blog/${id}`}
        className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-medium transition-colors text-sm"
      >
        Read More
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </a>
    </Card>
  );
};

export default Card;
