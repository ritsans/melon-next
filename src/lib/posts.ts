"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { postSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import type { Reaction } from "@/lib/reactions";

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
  reactions: Reaction[];
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
      profile:profiles(username, display_name, avatar_url),
      reactions(id, post_id, user_id, emoji, created_at)
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
      reactions: post.reactions || [],
    })) || []
  );
}

/**
 * Get posts filtered by tag, ordered by creation date (newest first)
 * @param tag - Tag to filter by
 * @returns Array of posts with the specified tag
 */
export async function getPostsByTag(tag: string): Promise<PostWithProfile[]> {
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
      profile:profiles(username, display_name, avatar_url),
      reactions(id, post_id, user_id, emoji, created_at)
    `,
    )
    .contains("tags", [tag])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts by tag:", error);
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
      reactions: post.reactions || [],
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

/**
 * Delete a post
 * @param postId - ID of the post to delete
 * @returns Success status and error message if any
 */
export async function deletePost(postId: string) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "ログインが必要です" };
    }

    // Create Supabase client
    const supabase = await createClient();

    // Delete post (RLS policy ensures user can only delete their own posts)
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      console.error("Error deleting post:", error);
      return { success: false, error: "投稿の削除に失敗しました" };
    }

    // Revalidate paths to update UI
    revalidatePath("/home");

    return { success: true };
  } catch (error) {
    console.error("Error in deletePost:", error);
    return { success: false, error: "投稿の削除に失敗しました" };
  }
}
