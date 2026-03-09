import type { Metadata } from "next";
import { EditBlog } from "@/features/dashboard/blogs";

export const metadata: Metadata = {
  title: "Dashboard — Edit Blog",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditBlogPage({ params }: Props) {
  const { id } = await params;
  return <EditBlog blogId={id} />;
}
