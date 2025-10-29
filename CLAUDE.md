# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A community-based content platform built with Next.js 16.0.0 and Supabase. It uses the App Router and is structured with TypeScript, Tailwind CSS v4, and Biome for code formatting. The platform features emotion-based reactions and tag-based post categorization for lightweight SNS interactions.

## Project Documentation

Important documentation for this project is located in the `docs/` directory:

Please be sure to read the following documentation before beginning any implementation.

 - **docs/requirements.md** : Contains the project requirements, business logic, and system constraints.

 - **docs/design.md**: Design document that includes technical design details such as architecture design, data models, and API specifications.

 - **docs/tasks.md**: Task list that tracks planned features, tasks in progress, and completed tasks.

Refer to these documents whenever implementing a new feature or reviewing existing code.

## Development Commands

### 開発サーバーの起動
```bash
pnpm dev
```
開発サーバーは http://localhost:3000 で起動します。

### ビルド
```bash
pnpm build
```
本番用の最適化されたビルドを生成します。

### 本番サーバーの起動
```bash
pnpm start
```
ビルド後の本番環境をローカルで実行します。

### リント
```bash
pnpm lint
```
We use ESLint to check code quality. Next.js's core-web-vitals and TypeScript configurations are applied.

- If you make major changes to the code or add new features, proactively run Lint and fix any problems.

### フォーマット
```bash
pnpm format
```
Biome を使用してコード全体を自動フォーマットします。

## Code Architecture

### ディレクトリ構造
- **`src/app/`**: Next.js App Router のルート定義
  - `layout.tsx`: グローバルレイアウト(Geist フォントの設定を含む)
  - `page.tsx`: トップページコンポーネント
  - `globals.css`: Tailwind CSS のグローバルスタイル
  - `(auth)/`: 認証関連のページグループ
    - `login/page.tsx`: ログインページ
    - `signup/page.tsx`: サインアップページ
- **`src/lib/`**: 共通ユーティリティ関数とヘルパー
  - `utils.ts`: `cn()` 関数 - clsx と tailwind-merge を組み合わせた Tailwind CSS のクラス名マージユーティリティ
  - `validations.ts`: Zod バリデーションスキーマ定義（ログイン、サインアップ、投稿フォームなど）
  - `auth.ts`: 認証ヘルパー関数（login, signup, logout, getCurrentUser, getProfile）
  - `supabase/`: Supabase クライアント設定
    - `client.ts`: クライアントサイド用 Supabase クライアント
    - `server.ts`: サーバーサイド用 Supabase クライアント
    - `database.types.ts`: データベース型定義（Supabase CLI で自動生成）
- **`src/components/`**: React コンポーネント
  - `ui/`: shadcn/ui コンポーネント（button, input, label, card など）
  - `auth/`: 認証関連コンポーネント
    - `LoginForm.tsx`: ログインフォーム
    - `SignupForm.tsx`: サインアップフォーム
- **`supabase/migrations/`**: データベースマイグレーションファイル
  - `20250927000000_initial_schema.sql`: 初期スキーマ（profiles, posts, reactions, tags テーブル）

### Path Alias
shadcn/ui の設定により、以下の path alias が利用可能です:

```typescript
import Component from "@/components/Component";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useCustomHook from "@/hooks/useCustomHook";
```

### shadcn/ui コンポーネントシステム
このプロジェクトは shadcn/ui を使用した UI コンポーネントシステムを採用しています:

- **スタイル**: New York スタイル
- **ベースカラー**: Neutral
- **アイコンライブラリ**: lucide-react
- **RSC 対応**: React Server Components をサポート
- **CSS Variables**: Tailwind CSS の CSS カスタムプロパティを使用
- **Dark Mode非対応**: ダークモードは使用しません。常にライトモードを使用

新しい UI コンポーネントを追加する場合は、shadcn/ui CLI (e.g `pnpm dlx shadcn@latest add button`) を使用してください。

## Code Style

### Biome フォーマット設定
- **インデント**: スペース 2 個
- **行の長さ**: 120 文字
- **引用符**: ダブルクォート
- **セミコロン**: 必須
- **末尾カンマ**: 常に付ける
- **Import の自動整理**: 有効

Biome はフォーマットのみに使用され、Lint は無効(ESLint を使用)。

### TypeScript 設定
- **Strict モード**: 有効
- **Target**: ES2024
- **JSX**: react-jsx(新しい JSX Transform)

## Key Technologies

### フロントエンド
- **Next.js 16.0.0**: React フレームワーク(App Router)
- **React 19.2.0**: UI ライブラリ
- **TypeScript 5**: 型システム
- **Tailwind CSS v4**: ユーティリティファーストの CSS フレームワーク
- **shadcn/ui**: 再利用可能な UI コンポーネントライブラリ
- **lucide-react**: アイコンライブラリ

### バックエンド・認証
- **Supabase**: バックエンドプラットフォーム（PostgreSQL + Auth + Storage）
- **@supabase/ssr**: Next.js App Router 対応の Supabase SSR クライアント
- **Supabase Auth**: メール・パスワード認証システム

### フォーム・バリデーション
- **React Hook Form**: 高パフォーマンスなフォーム管理ライブラリ
- **Zod**: TypeScript ファーストなスキーマバリデーション
- **@hookform/resolvers**: React Hook Form と Zod の統合

### ユーティリティ
- **class-variance-authority**: コンポーネントバリアント管理
- **clsx & tailwind-merge**: Tailwind CSS クラス名の条件付き結合とマージ
- **tw-animate-css**: Tailwind CSS アニメーションユーティリティ

### 開発ツール
- **Biome**: コードフォーマッター
- **ESLint**: リンター(Next.js 推奨設定)
- **Supabase CLI**: データベースマイグレーション管理

## Authentication System

このプロジェクトは Supabase Auth を使用したメール・パスワード認証を実装しています。

### 認証フロー

1. **サインアップ**: `/signup` でメールアドレスとパスワードを登録
2. **ログイン**: `/login` でメールアドレスとパスワードでログイン
3. **オンボーディング**: 初回登録後にユーザー名とプロフィール情報を設定（今後実装予定）
4. **セッション管理**: Supabase が Cookie ベースのセッション管理を自動処理

### 認証関連ファイル

- **`src/lib/auth.ts`**: 認証ヘルパー関数（Server Actions）
  - `login(data)`: ログイン処理
  - `signup(data)`: サインアップ処理
  - `logout()`: ログアウト処理
  - `getCurrentUser()`: 現在のユーザー取得
  - `getProfile(userId)`: プロフィール情報取得

- **`src/lib/validations.ts`**: フォームバリデーションスキーマ
  - `loginSchema`: ログインフォームのバリデーション
  - `signupSchema`: サインアップフォームのバリデーション
  - `onboardingSchema`: オンボーディングフォームのバリデーション
  - `postSchema`: 投稿フォームのバリデーション

### 環境変数

プロジェクトのルートに `.env.local` ファイルが必要です：

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_ACCESS_TOKEN=your-supabase-access-token
```

## MCP server

### Context7

- If you get a deprecated error, use the Context7 MCP server to get the latest version of the code syntax. If you want to get the latest information about the library, use Context7 as well.

## Important Notes

### Next.js 16 Changes

- Next.js 16（ベータ版）から、`middleware.ts` は非推奨となり、`proxy.ts` に名称が変更されました。
- 理由は、用語が持つ曖昧さを解消し、その機能の役割をより明確にするためです。

### Database Migrations

- データベーススキーマの変更は `supabase/migrations/` ディレクトリに SQL ファイルとして管理されます
- マイグレーションは Supabase CLI を使用して適用します： `supabase db push`
- 型定義の更新： `supabase gen types typescript --local > src/lib/supabase/database.types.ts`
