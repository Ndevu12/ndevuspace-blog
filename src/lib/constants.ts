import { getClientPublicConfig } from "@/lib/config";

const clientConfig = getClientPublicConfig();

export const SITE_URL = clientConfig.siteUrl;

// Portfolio site link (for "back to portfolio" nav)
export const PORTFOLIO_URL = "https://www.ndevuspace.com";

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// Social links
export const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/in/jean-paul-elisa",
  github: "https://github.com/Ndevu12",
  email: "hello@ndevuspace.com",
} as const;

// Default author info
export const DEFAULT_AUTHOR = {
  name: "Jean Paul Elisa NIYOKWIZERWA",
  firstName: "Jean Paul Elisa",
  lastName: "NIYOKWIZERWA",
  image: "/images/blog/placeholder.jpg",
} as const;
