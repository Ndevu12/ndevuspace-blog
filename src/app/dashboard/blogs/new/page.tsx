import type { Metadata } from "next";
import { NewBlog } from "@/features/dashboard/blogs";

export const metadata: Metadata = {
  title: "Dashboard — New Blog",
  robots: { index: false, follow: false },
};

export default function NewBlogPage() {
  return <NewBlog />;
}
