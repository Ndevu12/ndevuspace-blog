import type { Metadata } from "next";
import { AllBlogs } from "@/features/dashboard/blogs";

export const metadata: Metadata = {
  title: "Dashboard — All Blogs",
  robots: { index: false, follow: false },
};

export default function BlogsPage() {
  return <AllBlogs />;
}
