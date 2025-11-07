-- ============================================
-- Supabase Storage: gazo-images バケット設定
-- ============================================
--
-- このマイグレーションは、画像アップロード機能のための
-- Supabase Storage バケットとRLSポリシーを設定します。
--
-- 実行手順:
-- 1. Supabase Dashboard > Storage でバケットを作成
-- 2. このSQLをSupabase Dashboard > SQL Editorで実行
--
-- ============================================

-- バケット作成（手動設定）
-- ============================================
-- Supabase Dashboard > Storage > New Bucket で以下の設定を行う:
--
-- Bucket名: gazo-images
-- Public bucket: YES（公開アクセス許可）
-- File size limit: 5242880 (5MB)
-- Allowed MIME types: image/jpeg, image/png, image/gif, image/webp
--

-- ============================================
-- RLS（Row Level Security）ポリシー設定
-- ============================================

-- 1. 画像のアップロード: 認証済みユーザーのみ
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gazo-images');

-- 2. 画像の閲覧: すべてのユーザー（公開バケット）
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gazo-images');

-- 3. 画像の削除: 投稿者のみ（パス構造で制御）
-- パス形式: {post_id}/{timestamp}-{uuid}.{ext}
-- ユーザーは自分のpost_idフォルダ内の画像のみ削除可能
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'gazo-images' AND
  -- パスの最初のセグメント（post_id）から投稿の所有者を確認
  EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id::text = (storage.foldername(name))[1]
    AND posts.user_id = auth.uid()
  )
);

-- ============================================
-- 設定確認クエリ
-- ============================================
-- 以下のクエリで設定を確認できます:

-- バケット一覧確認
-- SELECT * FROM storage.buckets WHERE name = 'gazo-images';

-- RLSポリシー確認
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%images%';
