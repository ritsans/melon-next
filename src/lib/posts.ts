"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { postSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import type { Reaction } from "@/lib/reactions";
import { uploadImages, deletePostWithImages } from "@/lib/images";

export type PostWithProfile = {
  id: string;
  content: string;
  tags: string[];
  image_urls?: string[] | null;
  parent_post_id?: string | null;
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
      image_urls,
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
      image_urls: post.image_urls as string[] | null,
      created_at: post.created_at,
      user_id: post.user_id,
      profile: Array.isArray(post.profile) ? post.profile[0] : post.profile,
      reactions: post.reactions || [],
    })) || []
  );
}

/**
 * Get posts by user, ordered by creation date (newest first)
 * @param userId - User ID to filter by
 * @returns Array of posts by the specified user
 */
export async function getPostsByUser(userId: string): Promise<PostWithProfile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      content,
      tags,
      image_urls,
      created_at,
      user_id,
      profile:profiles(username, display_name, avatar_url),
      reactions(id, post_id, user_id, emoji, created_at)
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts by user:", error);
    return [];
  }

  // Transform the data to match our type
  return (
    data?.map((post) => ({
      id: post.id,
      content: post.content,
      tags: post.tags,
      image_urls: post.image_urls as string[] | null,
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
      image_urls,
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
      image_urls: post.image_urls as string[] | null,
      created_at: post.created_at,
      user_id: post.user_id,
      profile: Array.isArray(post.profile) ? post.profile[0] : post.profile,
      reactions: post.reactions || [],
    })) || []
  );
}

/**
 * Get a single post by ID
 * @param postId - Post ID to fetch
 * @returns Post with profile information or null if not found
 */
export async function getPostById(postId: string): Promise<PostWithProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      content,
      tags,
      image_urls,
      created_at,
      user_id,
      profile:profiles(username, display_name, avatar_url),
      reactions(id, post_id, user_id, emoji, created_at)
    `,
    )
    .eq("id", postId)
    .single();

  if (error) {
    console.error("Error fetching post by ID:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  // Transform the data to match our type
  return {
    id: data.id,
    content: data.content,
    tags: data.tags,
    image_urls: data.image_urls as string[] | null,
    created_at: data.created_at,
    user_id: data.user_id,
    profile: Array.isArray(data.profile) ? data.profile[0] : data.profile,
    reactions: data.reactions || [],
  };
}

/**
 * Create a new post
 * @param formData - Post content, tags, and optional images
 * @returns Success status and error message if any
 */
export async function createPost(formData: { content: string; tags: string[]; images?: File[] }) {
  try {
    // Validate form data (text only)
    const validatedData = postSchema.parse({ content: formData.content, tags: formData.tags });

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "ログインが必要です" };
    }

    // Create Supabase client
    const supabase = await createClient();

    // Generate temporary post ID for image folder
    const tempPostId = crypto.randomUUID();

    // Upload images if provided
    let imageUrls: string[] | undefined;
    if (formData.images && formData.images.length > 0) {
      try {
        imageUrls = await uploadImages(formData.images, tempPostId);
      } catch (uploadError) {
        console.error("Error uploading images:", uploadError);
        return { success: false, error: "画像のアップロードに失敗しました" };
      }
    }

    // Insert post with image URLs
    const { error } = await supabase.from("posts").insert({
      id: tempPostId,
      content: validatedData.content,
      tags: validatedData.tags,
      image_urls: imageUrls,
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

    // Get post details before deletion (including image URLs and profile info)
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("user_id, image_urls, profiles!inner(username)")
      .eq("id", postId)
      .single();

    if (fetchError || !post) {
      console.error("Error fetching post:", fetchError);
      return { success: false, error: "投稿が見つかりませんでした" };
    }

    // Delete post and associated images
    try {
      await deletePostWithImages(postId, (post.image_urls as string[] | null) || undefined);
    } catch (deleteError) {
      console.error("Error deleting post with images:", deleteError);
      return { success: false, error: "投稿の削除に失敗しました" };
    }

    // Revalidate paths to update UI
    revalidatePath("/home");
    // プロフィールページも再検証して、削除後に正しく表示されるようにする
    revalidatePath(`/profile/${post.profiles.username}`);

    return { success: true };
  } catch (error) {
    console.error("Error in deletePost:", error);
    return { success: false, error: "投稿の削除に失敗しました" };
  }
}
