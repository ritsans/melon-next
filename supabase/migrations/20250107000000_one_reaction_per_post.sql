-- リアクションシステムの変更: 1投稿につき1リアクションのみ許可
-- UNIQUE制約を (post_id, user_id, emoji) から (post_id, user_id) に変更

-- 既存の制約を削除
ALTER TABLE reactions DROP CONSTRAINT IF EXISTS reactions_post_id_user_id_emoji_key;

-- 新しい制約を追加（1ユーザーが1投稿に対して1リアクションのみ）
ALTER TABLE reactions ADD CONSTRAINT reactions_post_id_user_id_key UNIQUE(post_id, user_id);

-- 既存データのクリーンアップ（同一ユーザーが同一投稿に複数リアクションしている場合、最新のみ残す）
DELETE FROM reactions a
USING reactions b
WHERE a.post_id = b.post_id
  AND a.user_id = b.user_id
  AND a.created_at < b.created_at;
