import { getEnv } from "./envConfig";

// API configuration constants

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://my-brand-backend-apis.onrender.com/v1";

export const SITE_URL =
  getEnv("NEXT_PUBLIC_SITE_URL", "https://blog.ndevuspace.com");

// Portfolio site link (for "back to portfolio" nav)
export const PORTFOLIO_URL = "https://www.ndevuspace.com";

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// Social links
export const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/in/jean-paul-elisa",
  github: "https://github.com/Ndevu12",
  email: "ndevulion@gmail.com",
} as const;

// Default author info
export const DEFAULT_AUTHOR = {
  name: "Jean Paul Elisa NIYOKWIZERWA",
  firstName: "Jean Paul Elisa",
  lastName: "NIYOKWIZERWA",
  image: "/images/blog/placeholder.jpg",
} as const;
