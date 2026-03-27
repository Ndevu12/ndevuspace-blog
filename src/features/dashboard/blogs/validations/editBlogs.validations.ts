import { z } from "zod/v4";

export const blogFormSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    content: z.string().min(20, "Content must be at least 20 characters"),
    categoryId: z.string().min(1, "Please select a category"),
    tags: z.array(z.string()).optional(),
    readingTime: z.string().optional(),
    imageUrl: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    status: z.enum(["published", "draft"]),
  });
  