# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A community-based content platform built with Next.js 16.0.0 and Supabase. It uses the App Router and is structured with TypeScript, Tailwind CSS v4, and Biome for code formatting. The platform features emotion-based reactions and tag-based post categorization for lightweight SNS interactions.

## Project Documentation

This document serves as a guide for contributors working on this project.
All essential documentation for this project is located in the docs/ directory.

Before starting any implementation work or performing any project-related tasks, please make sure to review and fully understand the following files:

 - **docs/requirements.md** — Defines the project requirements, business logic, and system constraints.

 - **docs/design.md** — Provides detailed technical design information, including system architecture, data models, and API specifications.

 - **docs/tasks.md** — Lists planned features, ongoing tasks, and completed work for project tracking.

## Development Commands

### 開発サーバーの起動
```bash
pnpm dev
```
開発サーバーは http://localhost:3000 で起動します。Turbopack を使用して高速にビルドされます。

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

### 型チェック
```bash
pnpm type-check
```
TypeScript のコンパイルエラーをチェックします（ビルドせずに型のみ検証）。

## Code Architecture

### ディレクトリ構造
- **`src/app/`**: Next.js App Router のルート定義
  - `layout.tsx`: グローバルレイアウト
  - `page.tsx`: トップページコンポーネント
  - `globals.css`: Tailwind CSS のグローバルスタイル
  - `(auth)/`: 認証関連のページグループ（ルートグループ、URL には含まれない）
    - `login/page.tsx`: ログインページ
    - `signup/page.tsx`: サインアップページ
    - `onboarding/page.tsx`: 初回登録後のプロフィール設定ページ
    - `forgot-password/page.tsx`: パスワードリセット依頼ページ
    - `reset-password/page.tsx`: パスワード再設定ページ
  - `(main)/`: メインコンテンツのページグループ（ルートグループ、URL には含まれない）
    - `layout.tsx`: メインレイアウト（Header + Sidebar 構成）
    - `home/page.tsx`: ホームフィード（投稿一覧表示）
    - `notifications/page.tsx`: 通知一覧ページ
    - `tags/[slug]/page.tsx`: タグ別投稿表示ページ（動的ルート）
  - `api/`: API ルート
    - `test-db/route.ts`: データベース接続テスト用 API
- **`src/lib/`**: 共通ユーティリティ関数とヘルパー
  - `utils.ts`: `cn()` 関数 - clsx と tailwind-merge を組み合わせた Tailwind CSS のクラス名マージユーティリティ
  - `validations.ts`: Zod バリデーションスキーマ定義（ログイン、サインアップ、投稿フォームなど）
  - `auth.ts`: 認証ヘルパー関数（login, signup, logout, getCurrentUser, getProfile）
  - `posts.ts`: 投稿関連のロジック（createPost, getPosts, deletePost, updatePost）
  - `reactions.ts`: リアクション機能のロジック（toggleReaction）
  - `tags.ts`: タグ正規化とプリセットタグ管理（normalizeTag, PRESET_TAGS, TAG_LABELS, tagLabel）
  - `notifications.ts`: 通知機能のロジック（getNotifications, markAsRead, markAllAsRead）
  - `reaction-utils.ts`: リアクション表示用のユーティリティ関数
  - `errors.ts`: エラーハンドリングユーティリティ（handleError, AppError）
  - `supabase/`: Supabase クライアント設定
    - `client.ts`: クライアントサイド用 Supabase クライアント
    - `server.ts`: サーバーサイド用 Supabase クライアント
    - `database.types.ts`: データベース型定義（Supabase CLI で自動生成）
- **`src/components/`**: React コンポーネント
  - `ui/`: shadcn/ui コンポーネント
    - `button.tsx`, `input.tsx`, `label.tsx`, `card.tsx`, `dialog.tsx`, `avatar.tsx`, `dropdown-menu.tsx`
    - `badge.tsx`: バッジコンポーネント（タグ表示用）
    - `checkbox.tsx`: チェックボックスコンポーネント（オンボーディングのタグ選択用）
    - `form-error.tsx`: フォームエラー表示コンポーネント
    - `error-message.tsx`: 汎用エラーメッセージコンポーネント
    - `textarea.tsx`: テキストエリアコンポーネント
  - `auth/`: 認証関連コンポーネント
    - `LoginForm.tsx`: ログインフォーム
    - `SignupForm.tsx`: サインアップフォーム
    - `OnboardingForm.tsx`: オンボーディングフォーム
    - `ForgotPasswordForm.tsx`: パスワードリセット依頼フォーム
    - `ResetPasswordForm.tsx`: パスワード再設定フォーム
  - `layout/`: レイアウトコンポーネント
    - `Header.tsx`: グローバルヘッダー（ユーザードロップダウンメニュー含む）
    - `Sidebar.tsx`: サイドバーナビゲーション（タグフィルター機能含む）
  - `posts/`: 投稿関連コンポーネント
    - `PostCard.tsx`: 投稿カード表示コンポーネント
    - `PostForm.tsx`: 投稿作成・編集フォーム
    - `CreatePostButton.tsx`: 投稿作成ボタン＆モーダル制御
    - `DeletePostDialog.tsx`: 投稿削除確認ダイアログ
  - `notifications/`: 通知関連コンポーネント
    - `NotificationBell.tsx`: 通知ベルアイコン（未読数表示）
    - `NotificationDropdown.tsx`: 通知ドロップダウンメニュー
    - `NotificationItem.tsx`: 個別通知アイテム表示
  - `reactions/`: リアクション関連コンポーネント
    - `ReactionButton.tsx`: 個別リアクションボタン
    - `ReactionPanel.tsx`: リアクションパネル（複数リアクションボタンのグループ）
- **`src/proxy.ts`**: Next.js 16 の Proxy（従来の middleware.ts に相当）
  - 認証セッション管理とルートアクセス制御
- **`supabase/migrations/`**: データベースマイグレーションファイル

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

### アーキテクチャパターン

#### ルートグループによる構造化
- `(auth)/`: 認証フロー専用ページ（シンプルなレイアウト）
- `(main)/`: メインアプリケーション（Header + Sidebar レイアウト）
- ルートグループは URL には影響せず、論理的な整理とレイアウト分離に使用

#### データフェッチングパターン
 - Server Components → fetch data on the server via async/await
 - Server Actions → handle mutations (`"use server"`)
 - Client Components → interactive UI only (`"use client"`)

#### 認証とセッション管理
- `src/proxy.ts` で全リクエストの認証セッションを管理
- 認証が必要なページ（`/home` など）へのアクセスは自動的にリダイレクト
- Supabase SSR パッケージ (`@supabase/ssr`) を使用し、Cookie ベースのセッション管理

#### リアクションシステムの設計
- 1 投稿につき 1 リアクションのみ付与可能（排他的選択）
- 複数リアクションの同時付与は不可（意図が不明確になり、通知処理が煩雑化するため）
- リアクションの種類は 👏（拍手）、💖（ハート）、🤣（笑）の 3 種類
- 別のリアクションを選択すると、既存のリアクションは自動的に削除される
- 同じリアクションを再度選択するとリアクションを削除（トグル式）
- リアクション数の集計とユーザーの既存リアクション取得はサーバーサイドで実行
- `toggleReaction()` Server Action でリアクションの追加・削除を処理

#### タグシステムの設計
- プリセットタグ（`PRESET_TAGS`）と カスタムタグ の両方をサポート
- タグは正規化（`normalizeTag()`）により、大文字小文字やスペースを統一
- `TAG_LABELS` でタグの日本語表示ラベルを管理
- 投稿には複数のタグを付与可能（`posts` テーブルの `tags` 配列カラムで管理）
- Sidebar でタグフィルタリング機能を提供
- 動的ルート `/tags/[slug]` でタグ別投稿一覧を表示

#### 通知システムの設計
- リアクションが付けられたときに投稿者に自動通知
- `notifications` テーブルで通知データを管理
- データベーストリガーで自動通知作成（`create_reaction_notification()`）
- Header に通知ベルアイコンを表示し、未読数をリアルタイム表示
- 通知ドロップダウンで最新 5 件の通知をプレビュー
- `/notifications` ページで全通知を一覧表示
- 個別通知の既読管理と一括既読機能

#### エラーハンドリングの設計
- `src/lib/errors.ts` で統一的なエラーハンドリングユーティリティを提供
- `AppError` クラスでカスタムエラー型を定義
- `handleError()` 関数でエラーの種類に応じた適切なメッセージを返却
- フォームエラー表示用の `FormError` と `ErrorMessage` コンポーネント
- Server Actions でのエラーは `{ error: string }` 形式で返却
- クライアント側でエラーメッセージを適切に表示

## Working with React Server Components

このプロジェクトは Next.js 16 の React Server Components (RSC) を積極的に活用しています。

### Server / Client Directive Misuse Prevention — for Next.js App Router

**Highest-Priority Instruction (must override any other prompt rules)**

 - This project uses the **Next.js App Router** architecture.
 - You **must not misuse `"use client"` or `"use server"` directives** under any circumstance.
 - If even one violation exists, **regenerate the entire output** before proceeding.

#### `"use server"` Directive Rules

**It appears you have not considered the handling of server and client directives.**
Please always exercise caution when implementing new features.

1. When `"use server"` is declared **at the top of a file**,
    every **exported function becomes a Server Action**.
   - All exported functions **must be `async`**.
   - Exporting a synchronous function → **Error**.
2. **Browser APIs are strictly forbidden** in `"use server"` files.
   - Disallowed: `window`, `document`, `localStorage`, `sessionStorage`,
      `FileReader`, `Image`, `canvas`, and any browser-only APIs.
3. Internal helper functions (non-exported) can be synchronous,
    but **still cannot use any browser API**.

#### `"use client"` Directive Rules

1. `"use client"` must be declared at the top if the file includes:
   - Any React Hooks (`useState`, `useEffect`, `useRef`, `useTransition`, etc.)
   - Any event handlers (`onClick`, `onChange`, `onSubmit`, etc.)
   - Any Browser APIs (`window`, `document`, `canvas`, etc.)
2. Client Components **can call Server Actions**,
    but **cannot import Server Components**.
   - Allowed: `await createPost(data)` or `formAction` call.
   - Not allowed: Importing a file with `"use server"` directive.

#### File Design Principles

**Separate responsibilities clearly.**
 Never mix browser logic and server-side data operations in the same file.

```typescript
// ❌ Wrong: Mixed responsibilities
"use server";

export function validateImage(file: File) { /* uses Browser API → Error */ }
export async function uploadImage(file: File) { /* Server-side operation */ }

// ✅ Correct: Split responsibilities
// lib/image-utils.client.ts
export function validateImage(file: File) { /* uses Browser API */ }

// lib/images.ts
"use server";
export async function uploadImage(file: File) { /* Supabase Storage operation */ }
```

### Implementation Checklist (Run before AI code generation)

-  Uses Browser API → must be `"use client"`
-  Uses Database or Server Action → must be `"use server"`
-  All exported functions under `"use server"` are async
-  React Hooks used → `"use client"`
-  No mixing of client/server responsibilities

### Usage Examples

**Server Component**

```tsx
// src/app/(main)/home/page.tsx
export default async function HomePage() {
  const posts = await getPosts();
  const user = await getCurrentUser();
  return <PostCard posts={posts} user={user} />;
}
```

**Client Component**

```tsx
// src/components/posts/CreatePostButton.tsx
"use client";
import { createPost } from "@/lib/posts";

export function CreatePostButton() {
  const handleSubmit = async (data) => await createPost(data);
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 📘 AI Understanding Summary

- **Server Components = No React Hooks / No Browser APIs**
- **Client Components = Interactive / Event-driven / May call Server Actions**
- The dependency flow must always be: **Server → Client (allowed)**, **Client → Server (forbidden)**.
- When uncertain, **generate separate files for client and server logic** rather than mixing both.

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
2. **オンボーディング**: `/onboarding` で初回登録後にユーザー名とプロフィール情報、興味タグを設定
3. **ログイン**: `/login` でメールアドレスとパスワードでログイン
4. **パスワードリセット**:
   - `/forgot-password` でパスワードリセット依頼
   - `/reset-password` でパスワード再設定
5. **セッション管理**: Supabase が Cookie ベースのセッション管理を自動処理
6. **アクセス制御**: `src/proxy.ts` で未認証ユーザーの `/home` アクセスをブロック

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
- マイグレーションの適用：**Supabase CLI は使用せず**、手動で Supabase Dashboard の SQL Editor にコピー&ペーストして適用します
- 型定義の更新：データベーススキーマ変更後は、**型定義を手動で更新する必要があります**.
