# 設計書

## 概要

コミュニティ型コンテンツプラットフォームは、Next.js 15とSupabaseを使用したフルスタックWebアプリケーションです。感情ベースのリアクションシステムを特徴とし、タグによる投稿分類機能を持つ軽量SNSプラットフォームを構築します。

## アーキテクチャ

### 技術スタック

- **フロントエンド**: Next.js 15 (App Router)
- **言語**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **バリデーション**: Zod + React Hook Form
- **バックエンド**: Supabase (PostgreSQL + Auth + Storage)
- **認証**: Supabase Auth
- **デプロイ**: Vercel

### システム構成

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │────│   Supabase      │────│   PostgreSQL    │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
┌─────────────────┐    ┌─────────────────┐
│     Vercel      │    │ Supabase Storage│
│   (Hosting)     │    │   (Images)      │
└─────────────────┘    └─────────────────┘
```

## コンポーネント設計

### ディレクトリ構造

```
src/
├── app/
│   ├── layout.tsx                 # 全体レイアウト
│   ├── page.tsx                   # ホームフィード
│   ├── (auth)/
│   │   ├── login/page.tsx         # ログインページ
│   │   ├── signup/page.tsx        # サインアップページ
│   │   └── onboarding/page.tsx    # オンボーディングページ
│   ├── posts/
│   │   ├── new/page.tsx           # 新規投稿
│   │   └── [id]/page.tsx          # 投稿詳細
│   ├── tags/
│   │   └── [slug]/page.tsx        # タグ別投稿一覧
│   └── profile/
│       └── [username]/page.tsx    # ユーザープロフィール（@username形式）
├── components/
│   ├── layout/
│   │   ├── Header.tsx             # ヘッダーナビゲーション
│   │   └── Sidebar.tsx            # サイドバー（タグ一覧）
│   ├── posts/
│   │   ├── PostCard.tsx           # 投稿カード
│   │   ├── PostForm.tsx           # 投稿作成フォーム
│   │   └── PostList.tsx           # 投稿一覧
│   ├── reactions/
│   │   └── ReactionPanel.tsx      # リアクションパネル
│   ├── auth/
│   │   ├── LoginForm.tsx          # ログインフォーム
│   │   ├── SignupForm.tsx         # サインアップフォーム
│   │   └── OnboardingForm.tsx     # オンボーディングフォーム
│   └── ui/                        # shadcn/ui コンポーネント
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # クライアントサイド設定
│   │   └── server.ts              # サーバーサイド設定
│   ├── auth.ts                    # 認証ヘルパー
│   ├── validations.ts             # Zodスキーマ定義
│   └── utils.ts                   # ユーティリティ関数
├── hooks/
│   ├── useAuth.ts                 # 認証フック
│   └── usePosts.ts                # 投稿データフック
└── types/
    ├── auth.ts                    # 認証関連の型定義
    ├── post.ts                    # 投稿関連の型定義
    └── reaction.ts                # リアクション関連の型定義
```

### 主要コンポーネント

#### 1. レイアウトコンポーネント
- **Header**: ログイン状態表示、ナビゲーション
- **Sidebar**: 固定タグリスト、投稿作成ボタン

#### 2. 投稿関連コンポーネント
- **PostCard**: 投稿内容、作成者、リアクション表示
- **PostForm**: テキスト入力、タグ選択
- **PostList**: 投稿一覧の表示とページネーション

#### 3. リアクションコンポーネント
- **ReactionPanel**: 絵文字リアクション、カウント表示

## データモデル

### データベーススキーマ

```sql
-- ユーザーテーブル（Supabase Authと連携）
-- ハイブリッド方式：UUIDをプライマリキー、usernameをユーザー設定可能な識別子として使用
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY, -- システム内部ID（UUID）
  username TEXT UNIQUE NOT NULL,                 -- ユーザー設定可能ID（URL用）
  display_name TEXT,                             -- 表示名
  bio TEXT,                                      -- 自己紹介
  interests TEXT[],                              -- 興味のあることを配列で保存
  avatar_url TEXT,                               -- プロフィール画像URL
  onboarding_completed BOOLEAN DEFAULT FALSE,    -- オンボーディング完了フラグ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 投稿テーブル
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- リアクションテーブル
CREATE TABLE reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id, emoji)
);

-- タグテーブル（固定リスト用）
CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### TypeScript型定義

```typescript
// types/auth.ts
export interface Profile {
  id: string;
  username: string;
  display_name?: string;
  bio?: string;
  interests?: string[];
  avatar_url?: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface OnboardingData {
  username: string;
  display_name?: string;
  bio?: string;
  interests: string[];
}

// types/post.ts
export interface Post {
  id: string;
  user_id: string;
  content: string;
  tag: string;
  created_at: string;
  updated_at: string;
  profiles: Profile;
  reactions: Reaction[];
}

// types/reaction.ts
export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface ReactionCount {
  emoji: string;
  count: number;
  user_reacted: boolean;
}
```

## インターフェース設計

### API設計（Supabase）

#### 1. 認証API
```typescript
// ユーザー登録
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
});

// ログイン
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// オンボーディング完了
const { data, error } = await supabase
  .from('profiles')
  .upsert({
    id: user.id,
    username: 'screen_name',
    display_name: 'Display Name',
    bio: '自己紹介文',
    interests: ['技術', '雑談'],
    onboarding_completed: true
  });
```

#### 2. 投稿API
```typescript
// 投稿作成
const { data, error } = await supabase
  .from('posts')
  .insert({
    content: 'Hello World!',
    tag: 'general',
    user_id: user.id
  });

// 投稿一覧取得
const { data, error } = await supabase
  .from('posts')
  .select(`
    *,
    profiles(username, display_name, avatar_url),
    reactions(emoji, user_id)
  `)
  .order('created_at', { ascending: false });
```

#### 3. リアクションAPI
```typescript
// リアクション追加
const { data, error } = await supabase
  .from('reactions')
  .upsert({
    post_id: postId,
    user_id: userId,
    emoji: '👏'
  });

// リアクション削除
const { error } = await supabase
  .from('reactions')
  .delete()
  .match({ post_id: postId, user_id: userId, emoji: '👏' });
```

### UI/UX設計

#### 1. レスポンシブレイアウト
- **デスクトップ**: サイドバー + メインコンテンツ
- **モバイル**: ハンバーガーメニュー + フルスクリーン

#### 2. 固定タグリスト
```typescript
const FIXED_TAGS = [
  { name: '一般', slug: 'general' },
  { name: 'はじめて', slug: 'first-post' },
  { name: 'つぶやき', slug: 'tweet' },
  { name: '二次創作', slug: 'fanart' },
  { name: 'オリジナル', slug: 'original' }
];
```

#### 3. リアクション絵文字
```typescript
const REACTION_EMOJIS = ['👏', '💖', '🤣', '🤔', '👍'];
```

#### 4. オンボーディングフロー
```typescript
// オンボーディング状態チェック
const checkOnboardingStatus = async (userId: string) => {
  const { data } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', userId)
    .single();
  
  return data?.onboarding_completed || false;
};

// ユーザー名の重複チェック
const checkUsernameAvailability = async (username: string) => {
  const { data } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single();
  
  return !data; // データがなければ利用可能
};

// 興味のある分野の選択肢
const INTEREST_OPTIONS = [
  '技術', '雑談', '質問', 'ライフスタイル', 
  '趣味', '学習', 'ビジネス', 'エンタメ'
];
```

#### 5. ユーザーID設計（ハイブリッド方式）
```typescript
// プロフィールURL例: /profile/john_doe
// 内部処理: UUID（a1b2c3d4-e5f6-7890-abcd-ef1234567890）
// 表示: @john_doe

// ユーザー名バリデーション
const validateUsername = (username: string) => {
  const regex = /^[a-zA-Z0-9_]{3,20}$/;
  return regex.test(username);
};

// プロフィール取得（usernameベース）
const getProfileByUsername = async (username: string) => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();
  
  return data;
};
```

## エラーハンドリング

### 1. 認証エラー
- 無効なログイン情報
- セッション期限切れ
- 権限不足

### 2. データベースエラー
- 接続エラー
- バリデーションエラー
- 制約違反

### 3. フォームバリデーション（Zod）
```typescript
// lib/validations.ts
import { z } from 'zod';

// オンボーディングフォームスキーマ
export const onboardingSchema = z.object({
  username: z
    .string()
    .min(3, 'ユーザー名は3文字以上で入力してください')
    .max(20, 'ユーザー名は20文字以下で入力してください')
    .regex(/^[a-zA-Z0-9_]+$/, '英数字とアンダースコアのみ使用可能です'),
  display_name: z
    .string()
    .max(50, '表示名は50文字以下で入力してください')
    .optional(),
  bio: z
    .string()
    .max(200, '自己紹介は200文字以下で入力してください')
    .optional(),
  interests: z
    .array(z.string())
    .min(1, '興味のある分野を1つ以上選択してください')
    .max(5, '興味のある分野は5つまで選択可能です')
});

// 投稿フォームスキーマ
export const postSchema = z.object({
  content: z
    .string()
    .min(1, '投稿内容を入力してください')
    .max(500, '投稿は500文字以下で入力してください'),
  tag: z.string().min(1, 'タグを選択してください')
});

// ログインフォームスキーマ
export const loginSchema = z.object({
  email: z
    .string()
    .email('正しいメールアドレスを入力してください'),
  password: z
    .string()
    .min(6, 'パスワードは6文字以上で入力してください')
});

// サインアップフォームスキーマ
export const signupSchema = z.object({
  email: z
    .string()
    .email('正しいメールアドレスを入力してください'),
  password: z
    .string()
    .min(6, 'パスワードは6文字以上で入力してください'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword']
});
```

### 4. UI エラー表示
```typescript
// エラー状態管理
const [error, setError] = useState<string | null>(null);

// エラー表示コンポーネント
const ErrorMessage = ({ message }: { message: string }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
    {message}
  </div>
);

// フォームエラー表示（React Hook Form + Zod）
const FormError = ({ error }: { error?: string }) => {
  if (!error) return null;
  return (
    <p className="text-sm text-red-600 mt-1">{error}</p>
  );
};
```

## テスト戦略

### 1. 単体テスト
- コンポーネントのレンダリング
- ユーティリティ関数
- カスタムフック

### 2. 統合テスト
- API呼び出し
- 認証フロー
- データベース操作

### 3. E2Eテスト
- ユーザー登録からログインまでの流れ
- 投稿作成から表示まで
- リアクション機能

## セキュリティ考慮事項

### 1. 認証・認可
- Supabase Authによるセッション管理
- Row Level Security (RLS) の設定
- CSRF対策

### 2. データバリデーション
- クライアントサイドバリデーション
- サーバーサイドバリデーション
- SQLインジェクション対策

### 3. プライバシー
- 個人情報の適切な管理
- ユーザーデータの削除機能
- プロフィール公開範囲の制御

## パフォーマンス最適化

### 1. フロントエンド
- Next.js App Routerの活用
- 画像最適化
- コード分割

### 2. データベース
- 適切なインデックス設定
- クエリ最適化
- ページネーション実装

### 3. キャッシュ戦略
- Supabaseのキャッシュ機能
- ブラウザキャッシュ
- CDN活用（Vercel本番のみ）