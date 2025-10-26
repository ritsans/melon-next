-- Row Level Security (RLS) ポリシーの設定
-- セキュリティとアクセス制御のためのポリシー

-- RLSを有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- =====================
-- profiles テーブルのポリシー
-- =====================

-- 全員が全てのプロフィールを閲覧可能（未ログインユーザー含む）
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);

-- ユーザーは自分のプロフィールのみ挿入可能
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ユーザーは自分のプロフィールのみ更新可能
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ユーザーは自分のプロフィールのみ削除可能
CREATE POLICY "profiles_delete_own"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- =====================
-- posts テーブルのポリシー
-- =====================

-- 全員が全ての投稿を閲覧可能（未ログインユーザー含む）
CREATE POLICY "posts_select_all"
  ON posts FOR SELECT
  USING (true);

-- 認証済みユーザーのみ投稿を作成可能
CREATE POLICY "posts_insert_authenticated"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の投稿のみ更新可能
CREATE POLICY "posts_update_own"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の投稿のみ削除可能
CREATE POLICY "posts_delete_own"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================
-- reactions テーブルのポリシー
-- =====================

-- 全員が全てのリアクションを閲覧可能（未ログインユーザー含む）
CREATE POLICY "reactions_select_all"
  ON reactions FOR SELECT
  USING (true);

-- 認証済みユーザーのみリアクションを作成可能
CREATE POLICY "reactions_insert_authenticated"
  ON reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のリアクションのみ削除可能
CREATE POLICY "reactions_delete_own"
  ON reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================
-- tags テーブルのポリシー
-- =====================

-- 全員が全てのタグを閲覧可能（未ログインユーザー含む）
CREATE POLICY "tags_select_all"
  ON tags FOR SELECT
  USING (true);

-- タグの追加・編集・削除は管理者のみ（今後実装）
-- 現在は固定タグのみを使用するため、INSERT/UPDATE/DELETEポリシーは設定しない
