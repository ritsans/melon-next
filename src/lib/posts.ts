"use server";

import { createClient } from "@/lib/supabase/server";

export type PostWithProfile = {
  id: string;
  content: string;
  tag: string;
  created_at: string;
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
      tag,
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
      tag: post.tag,
      created_at: post.created_at,
      user_id: post.user_id,
      profile: Array.isArray(post.profile) ? post.profile[0] : post.profile,
    })) || []
  );
}
