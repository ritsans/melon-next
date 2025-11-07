# マイグレーションガイド

## リアクションシステムの変更（2025-01-07）

### 概要
リアクションシステムを「1投稿につき1リアクションのみ」に変更しました。

### 変更理由
1. **ユーザー意図の明確化**: 複数リアクションを許可すると、何を伝えたいのか不明確になる
2. **通知処理の簡素化**: 1投稿1リアクションにすることで、通知ロジックがシンプルになり保守性が向上

### データベースマイグレーション

#### ファイル
`supabase/migrations/20250107000000_one_reaction_per_post.sql`

#### 適用手順
Supabase Dashboard の SQL Editor で以下の手順を実行してください：

1. Supabase Dashboard にログイン
2. プロジェクトを選択
3. 左サイドバーから「SQL Editor」を選択
4. 「New Query」をクリック
5. `supabase/migrations/20250107000000_one_reaction_per_post.sql` の内容をコピー&ペースト
6. 「Run」ボタンをクリックして実行

#### マイグレーション内容
```sql
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
```

### アプリケーションコードの変更

#### 1. リアクションロジック（`src/lib/reactions.ts`）
- 既存のリアクションをチェックする際、`emoji` による絞り込みを削除
- 同じリアクションの場合は削除（トグル）
- 異なるリアクションの場合は更新（既存リアクションを新しいリアクションに変更）

#### 2. リアクションコンポーネント
- `ReactionPanel.tsx`: ユーザーの現在のリアクションを取得するロジックを追加
- `ReactionButton.tsx`: 1投稿1リアクションに対応したUI更新ロジックに変更

### 動作仕様

#### ユーザーの操作
1. **新しいリアクションを選択**: リアクションが追加される
2. **同じリアクションを再度選択**: リアクションが削除される（トグル）
3. **異なるリアクションを選択**: 既存のリアクションが新しいリアクションに変更される

#### 例
- ユーザーが 👏 をクリック → 👏 が追加される
- ユーザーが 👏 を再度クリック → 👏 が削除される
- ユーザーが 💖 をクリック → 👏 が削除され、💖 が追加される

### テスト

マイグレーション適用後、以下の動作を確認してください：

1. 新規リアクションの追加が正常に動作すること
2. 同じリアクションのトグル（削除）が正常に動作すること
3. 異なるリアクションへの変更が正常に動作すること
4. リアクション数のカウントが正確に表示されること
5. 通知が正常に送信されること

### ロールバック

万が一問題が発生した場合は、以下のSQLを実行して元に戻すことができます：

```sql
-- 新しい制約を削除
ALTER TABLE reactions DROP CONSTRAINT IF EXISTS reactions_post_id_user_id_key;

-- 元の制約を復元
ALTER TABLE reactions ADD CONSTRAINT reactions_post_id_user_id_emoji_key UNIQUE(post_id, user_id, emoji);
```

ただし、アプリケーションコードも元のバージョンに戻す必要があります。
