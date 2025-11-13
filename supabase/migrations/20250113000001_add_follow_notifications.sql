-- Add follow notification support to notifications table
-- This migration makes the notifications table more flexible and extensible

-- 1. Make post_id nullable to support notifications that are not related to posts
ALTER TABLE notifications
ALTER COLUMN post_id DROP NOT NULL;

-- 2. Add followed_user_id column for follow notifications
ALTER TABLE notifications
ADD COLUMN followed_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- 3. Add index for followed_user_id for better query performance
CREATE INDEX idx_notifications_followed_user_id ON notifications(followed_user_id);

-- 4. Add CHECK constraint to ensure 'type' column only accepts valid values
ALTER TABLE notifications
ADD CONSTRAINT check_notification_type_values CHECK (
  type IN ('reaction', 'reply', 'follow')
);

-- 5. Add CHECK constraint to ensure data consistency based on notification type
ALTER TABLE notifications
ADD CONSTRAINT check_notification_type_data CHECK (
  -- reaction: requires post_id and reaction_emoji, no followed_user_id
  (type = 'reaction' AND post_id IS NOT NULL AND reaction_emoji IS NOT NULL AND followed_user_id IS NULL) OR
  -- reply: requires post_id, no reaction_emoji or followed_user_id
  (type = 'reply' AND post_id IS NOT NULL AND reaction_emoji IS NULL AND followed_user_id IS NULL) OR
  -- follow: requires followed_user_id, no post_id or reaction_emoji
  (type = 'follow' AND post_id IS NULL AND reaction_emoji IS NULL AND followed_user_id IS NOT NULL)
);

-- Note: Existing data will remain valid as all existing notifications have post_id values
-- The nullable post_id and new followed_user_id enable future notification types beyond posts
