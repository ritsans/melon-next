# MacでのE2Eテスト実行ガイド

このガイドでは、Macでプロフィール編集機能のE2Eテストを実行する方法を説明します。

## 前提条件

- Node.js 20以上
- pnpm
- Supabaseプロジェクトが稼働している
- テストユーザーが作成済み

## セットアップ手順

### 1. リポジトリのクローンと依存関係のインストール

```bash
cd /path/to/melon-next
pnpm install
```

### 2. Playwrightブラウザのインストール

```bash
npx playwright install
```

Macでは、通常はシステム依存関係の追加インストールは不要です。

### 3. 環境変数の設定

`.env.local`ファイルが存在し、以下の環境変数が設定されていることを確認してください:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. テストユーザーの確認

Supabase Dashboardで以下のテストユーザーが作成されていることを確認してください:

**Primary User:**
- Email: `test@example.com`
- Password: `password12345`

**Secondary User (オプション):**
- Email: `test1@example.com`
- Password: `password12345`

テストユーザーの認証情報は `tests/helpers/auth.ts` で定義されています。

## テストの実行

### バリデーションテストの実行

バリデーションテストはブラウザを起動せず、高速に実行されます:

```bash
pnpm test tests/validations.test.ts
```

**期待される結果:**
- 78テスト全てが成功
- 実行時間: 約10-15秒

### E2Eテストの実行

#### すべてのE2Eテストを実行

```bash
pnpm test
```

これにより、以下のテストが実行されます:
- 認証機能テスト（8テスト）
- プロフィール編集テスト（16+テスト）
- バリデーションテスト（78テスト）

#### UIモードで実行（推奨）

```bash
pnpm test:ui
```

UIモードでは:
- 各テストの実行状況を視覚的に確認できます
- 失敗したテストのスクリーンショットを確認できます
- ステップバイステップで実行を追跡できます

#### 特定のテストファイルのみ実行

```bash
# 認証テストのみ
pnpm test tests/auth.spec.ts

# プロフィール編集テストのみ
pnpm test tests/profile-edit.spec.ts
```

#### デバッグモード

```bash
pnpm test:debug
```

デバッグモードでは、各ステップで実行を一時停止し、DevToolsで詳細を確認できます。

### テストレポートの表示

テスト実行後、HTMLレポートを表示できます:

```bash
pnpm test:report
```

ブラウザでインタラクティブなレポートが開きます。

## トラブルシューティング

### テストが失敗する場合

#### 1. 開発サーバーが起動していない

テストは自動的に開発サーバーを起動しますが、手動で起動することもできます:

```bash
pnpm dev
```

別のターミナルで:

```bash
pnpm test
```

#### 2. テストユーザーが存在しない

Supabase Dashboardで、テストユーザーが作成されていることを確認してください。

#### 3. 環境変数が設定されていない

`.env.local`ファイルが存在し、正しい値が設定されているか確認してください。

#### 4. ポート3000が使用中

別のアプリケーションがポート3000を使用している場合、開発サーバーが起動できません:

```bash
# ポート3000を使用しているプロセスを確認
lsof -i :3000

# プロセスを終了
kill -9 <PID>
```

### タイムアウトエラー

ネットワークが遅い場合やマシンのパフォーマンスが低い場合、タイムアウトが発生することがあります。`playwright.config.ts`で`timeout`を増やしてください:

```typescript
use: {
  baseURL: 'http://localhost:3000',
  trace: 'on-first-retry',
  timeout: 30000, // 30秒に増やす
},
```

## テスト対象

### プロフィール編集機能（tests/profile-edit.spec.ts）

- ✅ プロフィール編集ページへのアクセス
- ✅ フォームの表示確認
- ✅ 表示名のバリデーション（必須、最大50文字）
- ✅ 自己紹介のバリデーション（最大200文字、文字数カウンター）
- ✅ メールアドレスの読み取り専用確認
- ✅ 興味タグの選択
- ✅ プロフィール情報の更新
- ✅ キャンセルボタンの動作
- ✅ 未保存の変更がある場合の離脱警告
- ✅ アバター画像アップロード領域の確認
- ✅ レスポンシブデザイン（モバイル、タブレット、デスクトップ）
- ✅ アクセシビリティ（ラベル、キーボードナビゲーション）
- ✅ エラーハンドリング（ネットワークエラー）

### 認証機能（tests/auth.spec.ts）

- ✅ 正常なログイン
- ✅ 無効な認証情報でのログイン失敗
- ✅ 未認証状態での保護されたページへのアクセス
- ✅ ログアウト機能
- ✅ セッション永続性
- ✅ パスワードリセットページへのアクセス
- ✅ 認証済みユーザーのアクセス制御
- ✅ 未認証ユーザーのアクセス制御

### バリデーション（tests/validations.test.ts）

- ✅ display_nameフィールド（7テスト）
- ✅ bioフィールド（6テスト）
- ✅ interestsフィールド（5テスト）
- ✅ 複合バリデーション（4テスト）
- ✅ エッジケース（4テスト）

## 期待されるテスト結果

### 成功時

すべてのテストが成功した場合:

```
Running 102 tests using 3 workers

  102 passed (45s)
```

### 失敗時

失敗したテストがある場合、詳細なエラーメッセージとスクリーンショットが表示されます。HTMLレポートで詳細を確認してください:

```bash
pnpm test:report
```

## 次のステップ

テストが成功したら:

1. `docs/tasks.md`のtask52にチェックを入れる
2. GitHub Issue #3をクローズする
3. 変更をコミットしてプッシュする

```bash
git add .
git commit -m "test: プロフィール編集機能のE2Eテスト実装完了

- バリデーションテスト: 78テスト実装
- E2Eテスト: 認証 + プロフィール編集
- テストドキュメント整備
- Playwright設定完了

task52完了"
git push origin feature/test-suite
```

## 参考資料

- [Playwright公式ドキュメント](https://playwright.dev/)
- [tests/README.md](./README.md) - 詳細なテスト実行ガイド
- [docs/TEST_REPORT.md](../docs/TEST_REPORT.md) - テスト実施レポート
