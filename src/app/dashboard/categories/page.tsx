import type { Metadata } from "next";
import { CategoryManager } from "@/features/dashboard/categories";

export const metadata: Metadata = {
  title: "Dashboard — Categories",
  robots: { index: false, follow: false },
};

export default function CategoriesPage() {
  return <CategoryManager />;
}
