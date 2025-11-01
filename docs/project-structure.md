# プロジェクト構成ガイド

このドキュメントは、`melon-next` リポジトリの構成を俯瞰し、新しい貢献者が各機能の配置とプロジェクトの整理方針を理解できるようまとめたものです。

## ルートディレクトリ
- `src/`: Next.js アプリ本体。ルート構成、共有 UI コンポーネント、ドメインロジックなどのソースコードを格納します。
- `public/`: Next.js がそのまま配信する静的アセット（SVG アイコンやサンプル画像）。
- `docs/`: 既存の計画資料（設計、要件、タスク分解など）。
- `doc/`: 外部メンバー向けドキュメント置き場。このファイルが格納されています。
- `supabase/`: Supabase のスキーマを定義・更新するデータベースマイグレーション SQL。
- `node_modules/`: インストール済みの npm 依存パッケージ（自動管理。手動編集不要）。

主なルート直下の設定ファイル:
- `package.json`: プロジェクトのメタ情報、スクリプト（`dev`・`build`・`lint`・`format`・`type-check`）と依存関係一覧。
- `pnpm-lock.yaml`: `pnpm` 利用時の依存関係の固定バージョン。
- `tsconfig.json` / `tsconfig.tsbuildinfo`: TypeScript コンパイラ設定とインクリメンタルビルドのキャッシュ。
- `next.config.ts`: Next.js のフレームワーク設定。
- `eslint.config.mjs` と `biome.json`: Lint とフォーマッタのルール定義。
- `postcss.config.mjs`: TailwindCSS / PostCSS のパイプライン設定。
- `components.json`: shadcn/ui のコンポーネント登録情報。ローカルのデザインシステムツールで使用します。

## アプリケーションソース (`src/`)
- `app/`: Next.js App Router のルートツリー。
  - `layout.tsx` と `globals.css`: 全ページ共通のレイアウト枠とグローバルスタイル。
  - `(auth)/`: 認証関連ページのルートグループ（`login`・`signup`・`forgot-password`・`reset-password`・`onboarding`）。各サブフォルダに `page.tsx` が配置されています。
  - `(main)/`: メインアプリのレイアウトと `/home` ルート（`page.tsx`）。
  - `api/`: サーバーレス関数として公開するルートハンドラ（現在はデータベース接続確認用の `test-db/route.ts` を保持）。
  - `page.tsx`: `/` に対応するデフォルトのランディングページ。
  - `favicon.ico`: アプリにバンドルされるサイトアイコン。
- `components/`: 画面を構成する再利用可能な React コンポーネント群。
  - `auth/`: ログイン、サインアップ、パスワード関連、オンボーディング用フォーム。
  - `layout/`: ヘッダーやサイドバーなど、全体レイアウトを担うコンポーネント。
  - `posts/`: 投稿作成・表示に関する UI（投稿フォーム、カード、作成ボタンなど）。
  - `reactions/`: 投稿へのリアクション表示と操作を担当する部品。
  - `ui/`: shadcn/ui を元にした共通 UI（ボタン、ダイアログ、フォーム入力など）。プロジェクト内の他コンポーネントから広く参照されます。
- `lib/`: ドメインロジックやインフラ系ユーティリティ。
  - 認証補助 (`auth.ts`)、投稿ユーティリティ (`posts.ts`)、リアクション処理 (`reactions.ts`・`reaction-utils.ts`)、タグ操作 (`tags.ts`)、汎用ユーティリティ (`utils.ts`)、スキーマバリデーション (`validations.ts`) などを提供。
  - `supabase/`: ブラウザ用・サーバー用の Supabase クライアント (`client.ts`・`server.ts`) と、型安全な DB アクセスのための `database.types.ts` をまとめています。
- `proxy.ts`: Next.js のプロキシ設定エントリ。ミドルウェア的なリクエスト転送で利用します。

## アセットとスタイリング
- 画像や SVG は `public/` 配下にあり、`/ファイル名` で参照できます。
- グローバル CSS は `src/app/globals.css` から適用。コンポーネント単位のスタイルは TailwindCSS のユーティリティと共有 UI コンポーネントを組み合わせて構築しています。

## バックエンドとデータ
- `supabase/migrations/`: 連番付き SQL ファイル（`*_initial_schema.sql`、`*_rls_policies.sql`、`*_change_tag_to_array.sql`）で、テーブル作成、行レベルセキュリティ、スキーマ変更を定義。Supabase CLI やダッシュボード経由で適用し、環境間で同期させます。
- `src/lib/supabase/`: ブラウザ向け (`client.ts`)、サーバー向け (`server.ts`) の Supabase クライアントと、データベースを型安全に扱うための TypeScript 型定義をまとめています。

## 開発ツール
- ローカル開発は `pnpm dev` で起動（高速リロード対応）。
- `pnpm lint`、`pnpm format`、`pnpm type-check` を利用して、マージ前にコード品質を担保します。
- ESLint、Biome、Tailwind/PostCSS の設定により、Lint、整形、スタイルの統一を維持しています。

製品面の背景情報は `docs/` に、参入時に読むべきエントリーポイント資料はこの `doc/` ディレクトリにまとめられています。
