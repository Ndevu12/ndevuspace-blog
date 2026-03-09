import { BlogListingSkeleton } from "@/components/shared/LoadingStates";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <BlogListingSkeleton />
    </div>
  );
}
