-- フォロー関係テーブルの作成
-- ユーザー間のフォロー・フォロワー関係を管理するテーブル

CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 同じユーザーを重複してフォローできないようにする制約
  CONSTRAINT unique_follow UNIQUE (follower_id, following_id),

  -- 自分自身をフォローできないようにする制約
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- パフォーマンス最適化のためのインデックス
-- フォロワー一覧を取得するためのインデックス（誰が X をフォローしているか）
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

-- フォロー中一覧を取得するためのインデックス（X が誰をフォローしているか）
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);

-- 複合インデックス：特定のフォロー関係の存在確認を高速化
CREATE INDEX IF NOT EXISTS idx_follows_follower_following ON follows(follower_id, following_id);

-- 作成日時でのソート用インデックス
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at DESC);

-- RLS（Row Level Security）ポリシーの有効化
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- ポリシー: すべての認証済みユーザーはフォロー関係を閲覧可能
CREATE POLICY "Anyone can view follows"
  ON follows
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ポリシー: ユーザーは自分のフォロー関係のみ作成可能
CREATE POLICY "Users can follow others"
  ON follows
  FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- ポリシー: ユーザーは自分のフォロー関係のみ削除可能（フォロー解除）
CREATE POLICY "Users can unfollow others"
  ON follows
  FOR DELETE
  USING (auth.uid() = follower_id);
