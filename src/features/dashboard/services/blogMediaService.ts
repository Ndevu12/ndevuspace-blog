import { createClient } from "@/lib/supabase/client";
import { resolveBlogMediaObjectPath } from "@/features/dashboard/utils/blogMediaHelpers";

export async function uploadFeaturedImage(file: File, scope: { blogId?: string }): Promise<string> {
  const supabase = createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) {
    throw new Error(authError.message || "Failed to resolve authenticated user.");
  }

  const userId = authData.user?.id;
  if (!userId) {
    throw new Error("Authentication required to upload images.");
  }

  const objectPath = resolveBlogMediaObjectPath({
    userId,
    blogId: scope.blogId,
    fileName: file.name,
  });

  const { error: uploadError } = await supabase.storage
    .from("blog-media")
    .upload(objectPath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });

  if (uploadError) {
    throw new Error(uploadError.message || "Failed to upload image.");
  }

  const { data } = supabase.storage.from("blog-media").getPublicUrl(objectPath);
  if (!data.publicUrl) {
    throw new Error("Failed to generate public URL for uploaded image.");
  }

  return data.publicUrl;
}

export const blogMediaService = {
  uploadFeaturedImage,
};
