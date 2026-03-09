import React from "react";
import { LinkedInIcon, GitHubIcon, EmailIcon } from "@/components/atoms/Icon";
import { cn } from "@/lib/utils";

export interface SocialLink {
  name: string;
  url: string;
  icon: "linkedin" | "github" | "email" | "twitter";
  ariaLabel?: string;
}

export interface SocialLinksProps {
  links: SocialLink[];
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "footer" | "hero";
}

const SocialLinks: React.FC<SocialLinksProps> = ({
  links,
  className,
  size = "md",
  variant = "default",
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const variantClasses = {
    default: "hover:scale-110 transition-transform",
    footer:
      "p-2 rounded-full bg-gray-700/50 text-gray-300 hover:text-yellow-400 hover:bg-gray-700 transition-all",
    hero: "hover:scale-110 transition-transform duration-300",
  };

  const getIcon = (iconName: string, iconProps: any) => {
    switch (iconName) {
      case "linkedin":
        return <LinkedInIcon {...iconProps} />;
      case "github":
        return <GitHubIcon {...iconProps} />;
      case "email":
        return <EmailIcon {...iconProps} />;
      case "twitter":
        return (
          <svg className="fill-current" viewBox="0 0 24 24" {...iconProps}>
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("flex gap-4", className)}>
      {links.map((link, index) => (
        <a
          key={index}
          href={link.url}
          className={cn(variantClasses[variant])}
          aria-label={link.ariaLabel || `${link.name} Profile`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {variant === "footer" ? (
            getIcon(link.icon, { className: "w-5 h-5" })
          ) : (
            <div className={sizeClasses[size]}>
              {link.icon === "linkedin" && (
                <img
                  src="/images/linkedin-logo.png"
                  alt="LinkedIn"
                  className="w-full h-full"
                />
              )}
              {link.icon === "github" && (
                <img
                  src="/images/gith.png"
                  alt="GitHub"
                  className="w-full h-full"
                />
              )}
              {link.icon === "twitter" && (
                <img
                  src="/images/twitter-logo.png"
                  alt="Twitter"
                  className="w-full h-full"
                />
              )}
              {link.icon === "email" &&
                getIcon(link.icon, { className: "w-full h-full" })}
            </div>
          )}
        </a>
      ))}
    </div>
  );
};

// Predefined social links for the portfolio
export const portfolioSocialLinks: SocialLink[] = [
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/jean-paul-elisa",
    icon: "linkedin",
    ariaLabel: "LinkedIn Profile",
  },
  {
    name: "GitHub",
    url: "https://github.com/Ndevu12",
    icon: "github",
    ariaLabel: "GitHub Profile",
  },
  {
    name: "Email",
    url: "mailto:ndevulion@gmail.com",
    icon: "email",
    ariaLabel: "Send Email",
  },
];

export default SocialLinks;
