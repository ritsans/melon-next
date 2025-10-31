-- 投稿テーブルのtagカラムを単一テキストから配列に変更
-- 既存のデータを配列形式に変換

-- 1. 既存のtagカラムを一時的にリネーム
ALTER TABLE posts RENAME COLUMN tag TO tag_old;

-- 2. 新しいtagsカラムを配列型で追加
ALTER TABLE posts ADD COLUMN tags TEXT[] NOT NULL DEFAULT '{}';

-- 3. 既存データを配列形式に変換（既存データがある場合）
UPDATE posts SET tags = ARRAY[tag_old] WHERE tag_old IS NOT NULL;

-- 4. 古いカラムを削除
ALTER TABLE posts DROP COLUMN tag_old;

-- 5. インデックスを再作成（配列型対応）
DROP INDEX IF EXISTS idx_posts_tag;
CREATE INDEX idx_posts_tags ON posts USING GIN (tags);

-- 6. 既存のtagsテーブルのデータも更新（将来的な拡張用）
-- 固定タグを追加（一般、質問、雑談）
INSERT INTO tags (name, slug, description) VALUES
  ('質問', 'question', '質問や疑問の投稿'),
  ('雑談', 'chat', '雑談やカジュアルな会話')
ON CONFLICT (slug) DO NOTHING;
