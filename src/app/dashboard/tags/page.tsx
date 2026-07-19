import type { Metadata } from "next";
import { TagManager } from "@/features/dashboard/tags";

export const metadata: Metadata = {
  title: "Dashboard — Tags",
  robots: { index: false, follow: false },
};

export default function TagsPage() {
  return <TagManager />;
}
