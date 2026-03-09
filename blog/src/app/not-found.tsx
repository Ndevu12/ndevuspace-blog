import type { Metadata } from "next";
import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist or has been moved.",
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
      <FileQuestion className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-3xl font-bold">Page Not Found</h1>
      <p className="text-muted-foreground max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/blog">
        <Button>Back to Blog</Button>
      </Link>
    </div>
  );
}
