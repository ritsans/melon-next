-- reactionsテーブルにUPDATEポリシーを追加
-- 1投稿1リアクションシステムでは、emojiの変更が必要

-- ユーザーは自分のリアクションのみ更新可能
CREATE POLICY "reactions_update_own"
  ON reactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
