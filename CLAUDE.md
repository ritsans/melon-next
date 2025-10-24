# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A project based on Next.js 16.0.0. It uses the App Router and is structured with TypeScript, Tailwind CSS v4, and Biome for code formatting.

## Project Documentation

Important documentation for this project is located in the `docs/` directory:

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
- **`src/lib/`**: 共通ユーティリティ関数
  - `utils.ts`: `cn()` 関数 - clsx と tailwind-merge を組み合わせた Tailwind CSS のクラス名マージユーティリティ
- **`src/components/ui/`**: shadcn/ui コンポーネント(今後追加予定)

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

- **Next.js 16.0.0**: React フレームワーク(App Router)
- **React 19.2.0**: UI ライブラリ
- **TypeScript 5**: 型システム
- **Tailwind CSS v4**: ユーティリティファーストの CSS フレームワーク
- **Biome**: コードフォーマッター
- **ESLint**: リンター(Next.js 推奨設定)
- **shadcn/ui**: 再利用可能な UI コンポーネントライブラリ
- **class-variance-authority**: コンポーネントバリアント管理
- **clsx & tailwind-merge**: Tailwind CSS クラス名の条件付き結合とマージ
- **lucide-react**: アイコンライブラリ
- **tw-animate-css**: Tailwind CSS アニメーションユーティリティ

## MCP server

### Context7

- If you get a deprecated error, use the Context7 MCP server to get the latest version of the code syntax. If you want to get the latest information about the library, use Context7 as well.