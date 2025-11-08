-- ============================================
-- Supabase Storage: gazo_images バケット名修正
-- ============================================
--
-- 既存のRLSポリシーのbucket_idを 'gazo-images' から 'gazo_images' に更新
--
-- 背景:
-- - 実際のバケット名: gazo_images (アンダースコア)
-- - 既存ポリシー: gazo-images (ハイフン)
-- - この不一致によりRLSポリシー違反エラーが発生
--
-- 実行手順:
-- 1. Supabase Dashboard > SQL Editor でこのSQLを実行
--
-- ============================================

-- ============================================
-- 既存ポリシーの削除
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- ============================================
-- 新しいポリシーの作成 (bucket_id = 'gazo_images')
-- ============================================

-- 1. 画像のアップロード: 認証済みユーザーのみ
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gazo_images');

-- 2. 画像の閲覧: すべてのユーザー（公開バケット）
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gazo_images');

-- 3. 画像の削除: 投稿者のみ（パス構造で制御）
-- パス形式: {post_id}/{timestamp}-{uuid}.{ext}
-- ユーザーは自分のpost_idフォルダ内の画像のみ削除可能
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'gazo_images' AND
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
-- SELECT * FROM storage.buckets WHERE name = 'gazo_images';

-- RLSポリシー確認
-- SELECT schemaname, tablename, policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'objects' AND policyname LIKE '%images%';
