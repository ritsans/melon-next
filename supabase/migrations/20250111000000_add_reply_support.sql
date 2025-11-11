-- リプライ機能のためのスキーマ更新
-- postsテーブルにparent_post_idカラムを追加

-- parent_post_idカラムを追加（NULL許可、リプライの場合は親投稿のIDを格納）
ALTER TABLE posts
ADD COLUMN parent_post_id UUID REFERENCES posts(id) ON DELETE CASCADE;

-- parent_post_idにインデックスを作成（リプライ取得のパフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_posts_parent_post_id ON posts(parent_post_id);

-- 通常投稿とリプライを区別するための複合インデックス
-- parent_post_idがNULLの投稿（通常投稿）を効率的に取得するため
CREATE INDEX IF NOT EXISTS idx_posts_parent_null_created ON posts(created_at DESC)
WHERE parent_post_id IS NULL;

-- コメント追加（スキーマドキュメント）
COMMENT ON COLUMN posts.parent_post_id IS 'リプライ元の投稿ID。NULLの場合は通常投稿、値がある場合はリプライ';
