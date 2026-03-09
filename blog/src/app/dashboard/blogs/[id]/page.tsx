import type { Metadata } from "next";
import { AdminBlogDetail } from "@/features/dashboard/blogs";

export const metadata: Metadata = {
  title: "Dashboard — Blog Detail",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function BlogDetailPage({ params }: Props) {
  const { id } = await params;
  return <AdminBlogDetail blogId={id} />;
}
