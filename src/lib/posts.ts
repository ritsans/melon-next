"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { postSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export type PostWithProfile = {
  id: string;
  content: string;
  tags: string[];
  created_at: string | null;
  user_id: string;
  profile: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
};

/**
 * Get all posts ordered by creation date (newest first)
 * @returns Array of posts with profile information
 */
export async function getPosts(): Promise<PostWithProfile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      content,
      tags,
      created_at,
      user_id,
      profile:profiles(username, display_name, avatar_url)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  // Transform the data to match our type
  return (
    data?.map((post) => ({
      id: post.id,
      content: post.content,
      tags: post.tags,
      created_at: post.created_at,
      user_id: post.user_id,
      profile: Array.isArray(post.profile) ? post.profile[0] : post.profile,
    })) || []
  );
}

/**
 * Create a new post
 * @param formData - Post content and tags
 * @returns Success status and error message if any
 */
export async function createPost(formData: { content: string; tags: string[] }) {
  try {
    // Validate form data
    const validatedData = postSchema.parse(formData);

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "ログインが必要です" };
    }

    // Create Supabase client
    const supabase = await createClient();

    // Insert post
    const { error } = await supabase.from("posts").insert({
      content: validatedData.content,
      tags: validatedData.tags,
      user_id: user.id,
    });

    if (error) {
      console.error("Error creating post:", error);
      return { success: false, error: "投稿の作成に失敗しました" };
    }

    // Revalidate home page to show new post
    revalidatePath("/home");

    return { success: true };
  } catch (error) {
    console.error("Error in createPost:", error);
    return { success: false, error: "投稿の作成に失敗しました" };
  }
}
