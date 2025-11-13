-- Migration: Setup avatars storage bucket RLS policies
-- Description: Create RLS policies for the avatars bucket to allow users to manage their own avatar images
-- Prerequisites: The 'avatars' bucket must be created manually in Supabase Dashboard first
-- Date: 2025-11-13

-- ========================================
-- 重要: 最初に手動セットアップが必要です
-- ========================================
-- このマイグレーションを実行する前に、Supabse ダッシュボードで 'avatars' バケットを作成してください:
--
-- 1. Supabase ダッシュボード → Storage に移動
-- 2. 「New bucket」をクリック
-- 3. バケット設定:
--    - Name: avatars
--    - Public: ✓ 有効 (公開アクセスを許可)
--    - File size limit: 2097152 (2MB、バイト単位)
--    - Allowed MIME types: image/jpeg, image/png, image/webp
-- 4. 「Create bucket」をクリック
--
-- バケット作成後、SQL エディターでこのマイグレーションを実行してください。
-- ========================================

-- RLS Policy 1: Allow anyone to view avatar images (public read access)
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- RLS Policy 2: Allow authenticated users to upload their own avatar
-- Path structure: avatars/{userId}/avatar-{timestamp}.{ext}
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy 3: Allow authenticated users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy 4: Allow authenticated users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ========================================
-- ファイルパス構造
-- ========================================
-- avatars/
--   └── {userId}/
--       └── avatar-{timestamp}.{ext}
--
-- 例: avatars/550e8400-e29b-41d4-a716-446655440000/avatar-1704067200000.jpg
--
-- セキュリティ:
-- - ユーザーは自分のフォルダ内のファイルのみアクセス可能 (auth.uid() で識別)
-- - すべてのユーザーはアバター画像を表示できます (公開読み取り)
-- - オーナーのみがアバターのアップロード、更新、削除が可能です
-- ========================================

