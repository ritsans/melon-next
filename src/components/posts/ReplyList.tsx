import { getReplies } from "@/lib/posts";
import { ReplyCard } from "./ReplyCard";

type ReplyListProps = {
  postId: string;
  currentUserId?: string;
};

export async function ReplyList({ postId, currentUserId }: ReplyListProps) {
  const replies = await getReplies(postId);

  if (replies.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3 border-l-2 border-neutral-200 pl-4">
      {replies.map((reply) => (
        <ReplyCard key={reply.id} reply={reply} currentUserId={currentUserId} />
      ))}
    </div>
  );
}
