-- ============================================
-- Add image_urls column to posts table
-- ============================================
--
-- 画像投稿機能のために、postsテーブルにimage_urlsカラムを追加します。
--
-- 実行手順:
-- このSQLをSupabase Dashboard > SQL Editorで実行してください。
--
-- ============================================

-- postsテーブルにimage_urlsカラムを追加
-- JSONB型を使用して、画像URLの配列を格納（最大4枚）
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS image_urls JSONB;

-- image_urlsカラムのコメントを追加
COMMENT ON COLUMN posts.image_urls IS '投稿に添付された画像のURL配列（最大4枚）';

-- 設定確認クエリ
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'posts' AND column_name = 'image_urls';
