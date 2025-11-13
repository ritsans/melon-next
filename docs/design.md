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
│   ├── notifications/
│   │   ├── NotificationBell.tsx   # 通知ベルアイコンと未読バッジ
│   │   └── NotificationDropdown.tsx # 通知一覧ドロップダウン
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
- **Header**: ログイン状態表示、ナビゲーション、通知ベルアイコン
- **Sidebar**: メインナビゲーション（ホーム、通知など）、固定タグリスト、投稿作成ボタン
  - 🏠 ホーム: `/home` へのリンク（すべての投稿一覧）
  - 🔔 通知: `/notifications` へのリンク（将来実装予定）
- **NotificationBell**: 通知ベルアイコン、未読通知数バッジ
- **NotificationDropdown**: 通知一覧表示、既読/未読管理

#### 2. 投稿関連コンポーネント
- **PostCard**: 投稿内容、作成者、リアクション表示、画像グリッド表示
- **PostForm**: テキスト入力、タグ選択、画像アップロード機能
- **PostList**: 投稿一覧の表示とページネーション
- **ImageUploader**: 画像アップロード・プレビューコンポーネント（ドラッグ&ドロップ対応）
- **ImageGallery**: 投稿内画像のグリッド表示コンポーネント（レスポンシブ対応）
- **ImageLightbox**: 画像拡大表示モーダルコンポーネント（スワイプ/矢印ナビゲーション対応）

#### 3. リアクションコンポーネント
- **ReactionPanel**: 絵文字リアクション、カウント表示

## データモデル

### データベーススキーマ

```sql
-- ユーザーテーブル（Supabase Authと連携）
-- ハイブリッド方式：UUIDをプライマリキー、usernameをユーザー設定可能な識別子として使用
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY, -- システム内部ID（UUID）
  username TEXT UNIQUE NOT NULL,                 -- ユーザー設定可能ID（URL用、3-20文字、英数字とアンダースコアのみ）
  display_name TEXT,                             -- 表示名（15文字以下、省略可。省略時はusernameを表示）
  bio TEXT,                                      -- 自己紹介（200文字以下）
  interests TEXT[],                              -- 興味のあることを配列で保存（1-5個選択必須）
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
  image_urls JSONB,  -- 画像URLの配列 (例: ["url1", "url2"], 最大4枚)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- リアクションテーブル
-- 注：1投稿につき1リアクションのみ許可（排他的選択）
CREATE TABLE reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)  -- emojiを除外し、1投稿1リアクションを保証
);

-- タグテーブル（固定リスト用）
CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 通知テーブル
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,  -- 通知を受け取るユーザー
  actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL, -- 通知を発生させたユーザー
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,     -- 関連する投稿
  type TEXT NOT NULL,                                                -- 通知タイプ（'reaction', 'comment'等）
  emoji TEXT,                                                        -- リアクションの場合の絵文字
  is_read BOOLEAN DEFAULT FALSE,                                    -- 既読/未読フラグ
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

// 表示名の取得ヘルパー
// display_nameが未設定の場合はusernameを使用
export const getDisplayName = (profile: Profile): string => {
  return profile.display_name || profile.username;
}

// types/post.ts
export interface Post {
  id: string;
  user_id: string;
  content: string;
  tag: string;
  image_urls?: string[];  // 画像URLの配列（最大4枚）
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

// types/notification.ts
export interface Notification {
  id: string;
  user_id: string;         // 通知を受け取るユーザー
  actor_id: string;        // 通知を発生させたユーザー
  post_id: string;         // 関連する投稿
  type: 'reaction' | 'comment';  // 通知タイプ
  emoji?: string;          // リアクションの場合の絵文字
  is_read: boolean;        // 既読/未読フラグ
  created_at: string;
  actor?: Profile;         // 通知を発生させたユーザーの情報
  post?: Post;             // 関連する投稿の情報
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
// 投稿作成（画像付き）
const { data, error } = await supabase
  .from('posts')
  .insert({
    content: 'Hello World!',
    tag: 'general',
    user_id: user.id,
    image_urls: ['https://...', 'https://...'] // 画像URLの配列（最大4枚）
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

// 画像アップロードAPI
// Supabase Storageへのアップロード
const uploadImage = async (file: File, postId: string) => {
  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const uuid = crypto.randomUUID();
  const fileName = `${postId}/${timestamp}-${uuid}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('gazo-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  // 公開URLを取得
  const { data: { publicUrl } } = supabase.storage
    .from('gazo-images')
    .getPublicUrl(fileName);

  return publicUrl;
};

// 複数画像の一括アップロード
const uploadImages = async (files: File[], postId: string): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadImage(file, postId));
  return Promise.all(uploadPromises);
};

// 画像削除API
const deleteImage = async (imagePath: string) => {
  const { error } = await supabase.storage
    .from('gazo-images')
    .remove([imagePath]);

  if (error) throw error;
};

// 投稿削除時に関連画像も削除
const deletePostWithImages = async (postId: string, imageUrls?: string[]) => {
  // 画像削除
  if (imageUrls && imageUrls.length > 0) {
    const imagePaths = imageUrls.map(url => {
      const urlObj = new URL(url);
      return urlObj.pathname.replace('/storage/v1/object/public/gazo-images/', '');
    });
    await supabase.storage.from('gazo-images').remove(imagePaths);
  }

  // 投稿削除
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) throw error;
};
```

#### 3. リアクションAPI

**自分の投稿へのリアクション制限:**
- 自分の投稿には自分でリアクションできない（UIレベルで制限）
- ホーム画面：リアクションボタンは表示されるがクリック不可（disabled）
- プロフィールページ：リアクションパネル自体が非表示
- 他のユーザーがつけたリアクションは閲覧可能（カウント表示）

**リアクション表示ロジック:**
```typescript
// リアクションボタンの表示条件
// 1. count > 0: 誰かがリアクション済み（自分の投稿でも他人の投稿でも表示）
// 2. count === 0 && currentUserId && !isOwnPost: ログイン中で他人の投稿（リアクション追加可能）
// 3. count === 0 && isOwnPost: 非表示（自分の投稿で誰もリアクションしていない）

// 自分の投稿の場合
// - disabled={true}: クリック不可
// - cursor-not-allowed: 禁止カーソル
// - hover効果なし
// - 半透明にしない（他のユーザーのリアクションを見やすくするため）
```

```typescript
// リアクション追加/変更（1投稿1リアクションのため、upsertで既存リアクションを上書き）
const { data, error } = await supabase
  .from('reactions')
  .upsert(
    {
      post_id: postId,
      user_id: userId,
      emoji: '👏'
    },
    {
      onConflict: 'post_id,user_id'  // 同一投稿への既存リアクションを上書き
    }
  );

// リアクション削除
const { error } = await supabase
  .from('reactions')
  .delete()
  .match({ post_id: postId, user_id: userId });  // emojiは不要
```

#### 4. 通知API
```typescript
// 通知作成（リアクション時）
const { data, error } = await supabase
  .from('notifications')
  .insert({
    user_id: postAuthorId,      // 投稿者
    actor_id: currentUserId,     // リアクションしたユーザー
    post_id: postId,
    type: 'reaction',
    emoji: '👏'
  });

// 通知一覧取得
const { data, error } = await supabase
  .from('notifications')
  .select(`
    *,
    actor:profiles!actor_id(username, display_name, avatar_url),
    post:posts(id, content)
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(20);

// 未読通知数取得
const { count, error } = await supabase
  .from('notifications')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId)
  .eq('is_read', false);

// 通知を既読にする
const { error } = await supabase
  .from('notifications')
  .update({ is_read: true })
  .eq('id', notificationId);

// 全通知を既読にする
const { error } = await supabase
  .from('notifications')
  .update({ is_read: true })
  .eq('user_id', userId)
  .eq('is_read', false);
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
// 1投稿につき1リアクションのみ選択可能（排他的選択）
const REACTION_EMOJIS = ['👏', '💖', '🤣'];
```

#### 4. 通知テキスト生成
```typescript
// 通知メッセージの生成
const generateNotificationMessage = (notification: Notification): string => {
  const actorName = notification.actor?.display_name || notification.actor?.username || '誰か';

  switch (notification.type) {
    case 'reaction':
      return `${actorName}さんがあなたの投稿に${notification.emoji}しました`;
    case 'comment':
      return `${actorName}さんがあなたの投稿にコメントしました`;
    default:
      return `${actorName}さんからの通知`;
  }
};

// 相対時間表示
const getRelativeTime = (createdAt: string): string => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'たった今';
  if (diffMins < 60) return `${diffMins}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;
  return created.toLocaleDateString('ja-JP');
};
```

#### 5. オンボーディングフロー
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

#### 6. ユーザーID設計（ハイブリッド方式）
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
  tag: z.string().min(1, 'タグを選択してください'),
  images: z
    .array(z.instanceof(File))
    .max(4, '画像は最大4枚までアップロード可能です')
    .refine(
      (files) => files.every((file) => file.size <= 5 * 1024 * 1024),
      '各画像は5MB以下である必要があります'
    )
    .refine(
      (files) => files.every((file) =>
        ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
      ),
      'JPEG、PNG、GIF、WebP形式の画像のみアップロード可能です'
    )
    .optional()
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

## 画像機能の詳細設計

### 1. Supabase Storage 設定

#### バケット設定
```sql
-- gazo-imagesバケットの作成（Supabase Dashboardで実行）
-- Bucket名: gazo-images
-- Public bucket: true（公開アクセス許可）
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/gif, image/webp
```

#### RLS（Row Level Security）ポリシー
```sql
-- 画像のアップロード: 認証済みユーザーのみ
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gazo-images');

-- 画像の閲覧: すべてのユーザー（公開バケット）
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gazo-images');

-- 画像の削除: 投稿者のみ（パス構造で制御）
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'gazo-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 2. 画像アップロードフロー

```typescript
// lib/images.ts

// 画像リサイズとファイルサイズ圧縮
const resizeImage = async (file: File, maxWidth: number = 1200): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: file.type }));
            } else {
              reject(new Error('Failed to resize image'));
            }
          },
          file.type,
          0.85 // 画質85%で圧縮
        );
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// 画像バリデーション
const validateImage = (file: File): { valid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'JPEG、PNG、GIF、WebP形式の画像のみアップロード可能です' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: '画像サイズは5MB以下である必要があります' };
  }

  return { valid: true };
};
```

### 3. 画像表示コンポーネント設計

#### ImageGallery コンポーネント
```typescript
// components/posts/ImageGallery.tsx
interface ImageGalleryProps {
  images: string[];
  onImageClick: (index: number) => void;
}

// レスポンシブグリッドレイアウト
// 1枚: 1x1（フル幅）
// 2枚: 2x1（横並び）
// 3枚: 2x2（1枚大 + 2枚小）
// 4枚: 2x2（均等グリッド）
```

#### ImageLightbox 実装（yet-another-react-lightbox使用）
```typescript
// yet-another-react-lightbox ライブラリを使用
// https://yet-another-react-lightbox.com/

// パッケージインストール:
// pnpm add yet-another-react-lightbox

// ImageGallery コンポーネント内で使用:
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// 機能（ライブラリ提供）:
// - 画像の拡大表示（フルスクリーン）
// - スワイプジェスチャー対応（モバイル）
// - 矢印キー/ボタンでナビゲーション
// - ESCキーで閉じる
// - 画像インデックス表示（例: 1/4）
// - ズーム機能
// - アニメーション効果
```

#### ImageUploader コンポーネント
```typescript
// components/posts/ImageUploader.tsx
interface ImageUploaderProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number; // デフォルト: 4
}

// 機能:
// - ドラッグ&ドロップエリア
// - ファイル選択ボタン
// - プレビュー表示（サムネイル）
// - 個別画像の削除
// - 画像の並び替え（ドラッグ&ドロップ）
```

### 4. 画像URL管理

```typescript
// 画像URLからファイルパスを抽出
const getImagePathFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.replace('/storage/v1/object/public/gazo-images/', '');
  } catch {
    return '';
  }
};

// 投稿IDから画像フォルダパスを生成
const getImageFolderPath = (postId: string): string => {
  return `${postId}/`;
};
```

### 5. パフォーマンス最適化

#### 遅延読み込み
```typescript
// Next.js Image コンポーネントを使用
import Image from 'next/image';

<Image
  src={imageUrl}
  alt="投稿画像"
  width={600}
  height={400}
  loading="lazy"
  placeholder="blur"
  blurDataURL="/placeholder.png"
/>
```

#### プログレッシブローディング
- サムネイル表示時: 低解像度版を先に表示
- ライトボックス: 高解像度版を読み込み

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

## フォロー・フォロワー機能の設計

### 概要

ユーザー間のフォロー関係を管理し、パーソナライズされたコンテンツフィードを提供するソーシャル機能です。TwitterやInstagramのような双方向フォロー関係を実装します。

### データモデル

#### followsテーブル

```sql
-- フォロー関係テーブル
CREATE TABLE follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,  -- フォローする人
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL, -- フォローされる人
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),                                     -- 重複フォロー防止
  CHECK (follower_id != following_id)                                    -- 自分自身をフォロー禁止
);

-- インデックス: フォロワー一覧取得の最適化
CREATE INDEX idx_follows_following_id ON follows(following_id);

-- インデックス: フォロー中一覧取得の最適化
CREATE INDEX idx_follows_follower_id ON follows(follower_id);

-- インデックス: フォロー状態チェックの最適化
CREATE INDEX idx_follows_relationship ON follows(follower_id, following_id);
```

#### TypeScript型定義

```typescript
// types/follow.ts
export interface Follow {
  id: string;
  follower_id: string;   // フォローする人
  following_id: string;  // フォローされる人
  created_at: string;
}

// フォロー統計情報
export interface FollowStats {
  followers_count: number;  // フォロワー数
  following_count: number;  // フォロー中の数
}

// フォロー状態
export interface FollowStatus {
  is_following: boolean;      // 自分が相手をフォローしているか
  is_followed_by: boolean;    // 相手が自分をフォローしているか
  is_mutual: boolean;         // 相互フォローか
}

// フォロー一覧表示用（プロフィール情報付き）
export interface FollowWithProfile {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  profile: Profile;           // フォロワーまたはフォロー中のユーザー情報
  follow_status?: FollowStatus; // 現在のユーザーとの関係
}
```

### API設計（Supabase + Server Actions）

#### 1. フォロー関係の基本操作

```typescript
// lib/follows.ts
"use server";

// フォローする
export async function followUser(followingId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: '認証が必要です' };
  if (user.id === followingId) return { error: '自分自身をフォローできません' };

  const { error } = await supabase
    .from('follows')
    .insert({
      follower_id: user.id,
      following_id: followingId
    });

  if (error) return { error: 'フォローに失敗しました' };

  // 通知作成
  await createNotification({
    user_id: followingId,
    actor_id: user.id,
    type: 'follow'
  });

  return {};
}

// フォロー解除
export async function unfollowUser(followingId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: '認証が必要です' };

  const { error } = await supabase
    .from('follows')
    .delete()
    .match({
      follower_id: user.id,
      following_id: followingId
    });

  if (error) return { error: 'フォロー解除に失敗しました' };

  return {};
}

// フォロー状態を取得
export async function getFollowStatus(
  targetUserId: string
): Promise<FollowStatus | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;
  if (user.id === targetUserId) return null; // 自分自身は除外

  // 自分が相手をフォローしているか
  const { data: following } = await supabase
    .from('follows')
    .select('id')
    .match({
      follower_id: user.id,
      following_id: targetUserId
    })
    .single();

  // 相手が自分をフォローしているか
  const { data: followedBy } = await supabase
    .from('follows')
    .select('id')
    .match({
      follower_id: targetUserId,
      following_id: user.id
    })
    .single();

  const isFollowing = !!following;
  const isFollowedBy = !!followedBy;

  return {
    is_following: isFollowing,
    is_followed_by: isFollowedBy,
    is_mutual: isFollowing && isFollowedBy
  };
}
```

#### 2. フォロー統計情報の取得

```typescript
// フォロー統計を取得
export async function getFollowStats(userId: string): Promise<FollowStats> {
  const supabase = await createClient();

  // フォロワー数
  const { count: followersCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId);

  // フォロー中の数
  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId);

  return {
    followers_count: followersCount || 0,
    following_count: followingCount || 0
  };
}
```

#### 3. フォロー一覧の取得

```typescript
// フォロワー一覧を取得
export async function getFollowers(
  userId: string,
  currentUserId?: string
): Promise<FollowWithProfile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('follows')
    .select(`
      id,
      follower_id,
      following_id,
      created_at,
      follower:profiles!follower_id(
        id,
        username,
        display_name,
        avatar_url,
        bio
      )
    `)
    .eq('following_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  // 現在のユーザーとの関係を付与
  const followersWithStatus = await Promise.all(
    data.map(async (follow) => ({
      ...follow,
      profile: follow.follower,
      follow_status: currentUserId
        ? await getFollowStatus(follow.follower_id)
        : undefined
    }))
  );

  return followersWithStatus;
}

// フォロー中の一覧を取得
export async function getFollowing(
  userId: string,
  currentUserId?: string
): Promise<FollowWithProfile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('follows')
    .select(`
      id,
      follower_id,
      following_id,
      created_at,
      following:profiles!following_id(
        id,
        username,
        display_name,
        avatar_url,
        bio
      )
    `)
    .eq('follower_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  // 現在のユーザーとの関係を付与
  const followingWithStatus = await Promise.all(
    data.map(async (follow) => ({
      ...follow,
      profile: follow.following,
      follow_status: currentUserId
        ? await getFollowStatus(follow.following_id)
        : undefined
    }))
  );

  return followingWithStatus;
}
```

#### 4. フォロー中ユーザーの投稿取得

```typescript
// lib/posts.ts に追加

// フォロー中のユーザーの投稿を取得
export async function getFollowingPosts(): Promise<Post[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // フォロー中のユーザーIDを取得
  const { data: followingData } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id);

  if (!followingData || followingData.length === 0) return [];

  const followingIds = followingData.map(f => f.following_id);

  // フォロー中のユーザーの投稿を取得
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles(username, display_name, avatar_url),
      reactions(emoji, user_id)
    `)
    .in('user_id', followingIds)
    .is('parent_post_id', null) // トップレベル投稿のみ
    .order('created_at', { ascending: false });

  if (error || !posts) return [];

  return posts;
}
```

### UI/UXコンポーネント設計

#### 1. FollowButton コンポーネント

```typescript
// components/follows/FollowButton.tsx
"use client";

interface FollowButtonProps {
  userId: string;
  username: string;
  initialFollowStatus: FollowStatus | null;
  size?: "default" | "sm" | "lg";
}

// 機能:
// - フォロー/フォロー解除のトグルボタン
// - 楽観的UI更新（即座に反映）
// - ローディング状態表示
// - 相互フォロー表示（アイコンまたはテキスト）
// - 自分自身の場合はボタン非表示

// ボタンスタイル:
// - フォロー前: Primary色の「フォロー」ボタン
// - フォロー中: Ghost/Outline の「フォロー中」ボタン
// - 相互フォロー: 「相互フォロー」テキスト + チェックアイコン
```

#### 2. FollowList コンポーネント

```typescript
// components/follows/FollowList.tsx

interface FollowListProps {
  users: FollowWithProfile[];
  type: 'followers' | 'following';
  currentUserId?: string;
}

// 機能:
// - フォロワー/フォロー中のユーザー一覧表示
// - 各ユーザーのアバター、表示名、ユーザー名、bio表示
// - 各ユーザーへのFollowButtonを表示
// - プロフィールへのリンク
// - 空状態の表示（「まだフォロワーがいません」等）
// - ページネーション（将来実装）
```

#### 3. FeedTabs コンポーネント

```typescript
// components/posts/FeedTabs.tsx

interface FeedTabsProps {
  activeTab: 'all' | 'following';
  onTabChange: (tab: 'all' | 'following') => void;
}

// 機能:
// - 「すべて」と「フォロー中」のタブ切り替え
// - 選択中のタブをハイライト表示
// - タブ切り替え時のスムーズな遷移

// レイアウト:
// ┌──────────┬──────────┐
// │ すべて   │ フォロー中│
// └──────────┴──────────┘
```

### ページ構成

#### 1. プロフィールページの拡張

```typescript
// app/(main)/profile/[username]/page.tsx

// 追加要素:
// - FollowButton（他のユーザーのプロフィール表示時）
// - FollowStats（フォロワー数、フォロー中の数）
// - フォロー状態表示（相互フォロー等）
```

#### 2. フォロワー一覧ページ

```typescript
// app/(main)/profile/[username]/followers/page.tsx

// 機能:
// - そのユーザーのフォロワー一覧を表示
// - FollowListコンポーネントを使用
// - 自分のフォロワー一覧か他人のフォロワー一覧かで表示を調整
```

#### 3. フォロー中一覧ページ

```typescript
// app/(main)/profile/[username]/following/page.tsx

// 機能:
// - そのユーザーがフォロー中のユーザー一覧を表示
// - FollowListコンポーネントを使用
// - 自分のフォロー中一覧か他人のフォロー中一覧かで表示を調整
```

#### 4. ホームフィードとみんなの投稿の分離

**設計変更（2025-11-12）:**
従来の「ホーム = すべての投稿」から、よりパーソナライズされた体験に変更します。

**新しいページ構成:**

```typescript
// app/(main)/home/page.tsx
// 新しいホーム: フォロー中のユーザーの投稿のみを表示
// - getFollowingPosts() を使用してフォロー中の投稿を取得
// - フォロー中のユーザーがいない場合のオンボーディングメッセージ
// - 「みんなの投稿を見る」へのリンクを提供

// app/(main)/everyone/page.tsx
// みんなの投稿: すべてのユーザーの投稿を表示（従来のホーム機能）
// - getPosts() を使用してすべての投稿を取得
// - 投稿一覧をタグでフィルタリング可能
```

**ナビゲーション:**
- Sidebarに「🏠 ホーム」（フォロー中）と「🌐 みんなの投稿」の両方を表示
- ホームをデフォルトのランディングページとする

**フォロー中のユーザーがいない場合:**
```typescript
// ホームページでの空状態メッセージ
<EmptyState>
  <p>まだフォロー中のユーザーがいません</p>
  <p>みんなの投稿を見て、興味のあるユーザーをフォローしましょう！</p>
  <Link href="/everyone">
    <Button>みんなの投稿を見る</Button>
  </Link>
</EmptyState>
```

### 通知システムとの統合

#### notificationsテーブルの拡張

```sql
-- 既存のnotificationsテーブルにフォロー通知を追加
-- typeに 'follow' を追加（既存: 'reaction', 'reply'）

-- フォロー通知の例:
INSERT INTO notifications (
  user_id,      -- フォローされた人
  actor_id,     -- フォローした人
  type,         -- 'follow'
  is_read,      -- false
  created_at
) VALUES (...);
```

#### 通知メッセージ生成の拡張

```typescript
// lib/notifications.ts に追加

const generateNotificationMessage = (notification: Notification): string => {
  const actorName = notification.actor?.display_name || notification.actor?.username || '誰か';

  switch (notification.type) {
    case 'reaction':
      return `${actorName}さんがあなたの投稿に${notification.emoji}しました`;
    case 'reply':
      return `${actorName}さんがあなたの投稿に返信しました`;
    case 'follow':
      return `${actorName}さんがあなたをフォローしました`;
    default:
      return `${actorName}さんからの通知`;
  }
};
```

### セキュリティ・バリデーション

#### RLSポリシー

```sql
-- フォロー関係の閲覧: すべてのユーザー
CREATE POLICY "Anyone can view follows"
ON follows FOR SELECT
TO public
USING (true);

-- フォロー関係の作成: 認証済みユーザー（自分がfollower）
CREATE POLICY "Users can follow others"
ON follows FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = follower_id AND
  follower_id != following_id
);

-- フォロー関係の削除: 認証済みユーザー（自分がfollower）
CREATE POLICY "Users can unfollow others"
ON follows FOR DELETE
TO authenticated
USING (auth.uid() = follower_id);
```

#### バリデーション

```typescript
// lib/validations.ts に追加

export const followSchema = z.object({
  following_id: z.string().uuid('無効なユーザーIDです')
});

// フォロー処理のバリデーション:
// 1. ユーザー認証チェック
// 2. 自分自身をフォローしないチェック
// 3. 既にフォロー済みでないかチェック
// 4. フォロー対象ユーザーが存在するかチェック
```

### パフォーマンス最適化

#### 1. インデックス戦略

```sql
-- フォロワー一覧取得の最適化
CREATE INDEX idx_follows_following_id ON follows(following_id);

-- フォロー中一覧取得の最適化
CREATE INDEX idx_follows_follower_id ON follows(follower_id);

-- フォロー状態チェックの最適化（複合インデックス）
CREATE INDEX idx_follows_relationship ON follows(follower_id, following_id);

-- 作成日時ソートの最適化
CREATE INDEX idx_follows_created_at ON follows(created_at DESC);
```

#### 2. クエリ最適化

```typescript
// バッチ処理でフォロー状態を取得（N+1問題の回避）
export async function getBatchFollowStatus(
  targetUserIds: string[]
): Promise<Map<string, FollowStatus>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return new Map();

  // 一括でフォロー関係を取得
  const { data } = await supabase
    .from('follows')
    .select('follower_id, following_id')
    .or(`follower_id.eq.${user.id},following_id.eq.${user.id}`)
    .in('following_id', targetUserIds)
    .in('follower_id', [user.id, ...targetUserIds]);

  // マップに変換
  const statusMap = new Map<string, FollowStatus>();
  // ... ロジック実装

  return statusMap;
}
```

#### 3. キャッシュ戦略

- フォロー統計はプロフィールページで5分間キャッシュ
- フォロー状態は楽観的UI更新でユーザー体験を向上
- フォロー一覧はページネーションで分割読み込み

### エラーハンドリング

```typescript
// エラーケース:
// 1. 未認証ユーザーのフォロー試行
// 2. 自分自身をフォロー試行
// 3. 既にフォロー済みのユーザーを再フォロー
// 4. 存在しないユーザーをフォロー
// 5. データベース接続エラー
// 6. RLSポリシー違反

// エラーメッセージ:
const ERROR_MESSAGES = {
  UNAUTHENTICATED: 'ログインが必要です',
  SELF_FOLLOW: '自分自身をフォローできません',
  ALREADY_FOLLOWING: '既にフォローしています',
  USER_NOT_FOUND: 'ユーザーが見つかりません',
  DATABASE_ERROR: 'フォローに失敗しました。もう一度お試しください',
  PERMISSION_DENIED: '権限がありません'
};
```

### テスト戦略

#### 1. 単体テスト
- フォロー/フォロー解除関数
- フォロー状態取得関数
- フォロー統計計算関数

#### 2. 統合テスト
- フォロー → 通知作成の流れ
- フォロー → フィード反映の流れ
- フォロー解除 → データ整合性

#### 3. E2Eテスト
- ユーザーAがユーザーBをフォロー
- フォロワー一覧・フォロー中一覧の表示
- フォロー中のユーザーの投稿フィルタリング

### 実装の段階的ロードマップ

#### Phase 1: 基本フォロー機能（最優先）
- followsテーブル作成
- フォロー/フォロー解除のServer Actions
- FollowButtonコンポーネント
- プロフィールページへの統合

#### Phase 2: フォロー一覧表示
- フォロー統計表示
- フォロワー一覧ページ
- フォロー中一覧ページ

#### Phase 3: フィード統合
- フォロー中の投稿フィルタリング
- FeedTabsコンポーネント
- ホームフィードの拡張

#### Phase 4: 通知・拡張機能
- フォロー通知
- 相互フォロー表示
- おすすめユーザー機能（将来）

---

## プロフィール編集機能の設計

### 概要

ユーザーが自分のプロフィール情報を編集できる機能を提供します。表示名、アバター画像、自己紹介、興味タグの編集が可能で、メールアドレスは表示のみ（編集不可）とします。

### 機能要件

#### 編集可能な項目
- **表示名（display_name）**: 必須、1-50文字
- **アバター画像（avatar_url）**: オプション、JPEG/PNG/WebP、最大2MB、推奨サイズ400x400px
- **自己紹介（bio）**: オプション、0-200文字
- **興味タグ（interests）**: オプション、複数選択可能

#### 表示のみの項目
- **メールアドレス**: Supabase Authで管理、表示のみ（編集不可）
- **ユーザー名（username）**: 一意識別子、編集不可

### データモデル

#### profilesテーブル（既存）

```sql
-- プロフィール情報はすでに存在するため、新規テーブル作成は不要
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  interests TEXT[],
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### バリデーション制約

```typescript
// lib/validations.ts
export const profileEditSchema = z.object({
  display_name: z
    .string()
    .min(1, "表示名は必須です")
    .max(50, "表示名は50文字以内で入力してください"),
  bio: z
    .string()
    .max(200, "自己紹介は200文字以内で入力してください")
    .optional()
    .or(z.literal("")),
  interests: z.array(z.string()).optional(),
  avatar: z
    .instanceof(File)
    .refine((file) => file.size <= 2 * 1024 * 1024, "画像サイズは2MB以下にしてください")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "JPEG、PNG、WebP形式の画像のみアップロード可能です"
    )
    .optional(),
});
```

### Supabase Storage設計

#### avatarsバケット

```sql
-- Supabase Storage設定（ダッシュボードで実施）
バケット名: avatars
公開アクセス: 有効
ファイル形式: image/*
最大ファイルサイズ: 2MB

-- RLSポリシー
-- 1. 誰でも閲覧可能
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 2. 認証済みユーザーは自分のアバターをアップロード可能
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. 認証済みユーザーは自分のアバターを更新可能
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. 認証済みユーザーは自分のアバターを削除可能
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### ファイルパス構造

```
avatars/
  └── {userId}/
      └── avatar-{timestamp}.{ext}

例: avatars/550e8400-e29b-41d4-a716-446655440000/avatar-1704067200000.jpg
```

### API設計（Server Actions）

#### 1. プロフィール情報の更新

```typescript
// lib/profiles.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(data: {
  display_name: string;
  bio?: string;
  interests?: string[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "ログインが必要です" };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: data.display_name,
        bio: data.bio || null,
        interests: data.interests || [],
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Profile update error:", error);
      return { success: false, error: "プロフィールの更新に失敗しました" };
    }

    // キャッシュを再検証
    revalidatePath(`/profile/${user.username}`);
    revalidatePath("/profile/edit");

    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}
```

#### 2. アバター画像の更新

```typescript
// lib/profiles.ts
export async function updateAvatar(
  file: File
): Promise<{ success: boolean; avatarUrl?: string; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "ログインが必要です" };
    }

    // 既存のアバターを削除
    if (user.avatar_url) {
      await deleteAvatar(user.avatar_url);
    }

    // 新しいアバターをアップロード
    const avatarUrl = await uploadAvatar(file, user.id);

    // データベースを更新
    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Avatar update error:", error);
      return { success: false, error: "アバターの更新に失敗しました" };
    }

    revalidatePath(`/profile/${user.username}`);
    revalidatePath("/profile/edit");

    return { success: true, avatarUrl };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}

export async function removeAvatar(): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "ログインが必要です" };
    }

    // Storageから削除
    if (user.avatar_url) {
      await deleteAvatar(user.avatar_url);
    }

    // データベースを更新
    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Avatar removal error:", error);
      return { success: false, error: "アバターの削除に失敗しました" };
    }

    revalidatePath(`/profile/${user.username}`);
    revalidatePath("/profile/edit");

    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}
```

#### 3. 画像ユーティリティ関数

```typescript
// lib/images.ts（既存ファイルに追加）

const AVATARS_BUCKET = "avatars";

/**
 * アバター画像をSupabase Storageにアップロード
 * @param file - アップロードする画像ファイル
 * @param userId - ユーザーID
 * @returns 公開URL
 */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const supabase = await createClient();

  // ファイル名の生成: {userId}/avatar-{timestamp}.{ext}
  const fileExt = file.name.split(".").pop();
  const timestamp = Date.now();
  const fileName = `${userId}/avatar-${timestamp}.${fileExt}`;

  // Supabase Storageにアップロード
  const { data, error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Avatar upload error:", error);
    throw new Error(`アバターのアップロードに失敗しました: ${error.message}`);
  }

  // 公開URLを取得
  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(data.path);

  return publicUrl;
}

/**
 * アバター画像をSupabase Storageから削除
 * @param avatarUrl - 削除するアバターの公開URL
 */
export async function deleteAvatar(avatarUrl: string): Promise<void> {
  const supabase = await createClient();

  // URLからパスを抽出
  const path = getImagePathFromUrl(avatarUrl, AVATARS_BUCKET);
  if (!path) {
    console.warn("Invalid avatar URL:", avatarUrl);
    return;
  }

  const { error } = await supabase.storage.from(AVATARS_BUCKET).remove([path]);

  if (error) {
    console.error("Avatar deletion error:", error);
    // 削除エラーは致命的ではないためログのみ出力
  }
}

/**
 * アバター画像のバリデーション
 * @param file - 検証する画像ファイル
 * @returns バリデーション結果
 */
export function validateAvatarImage(file: File): { valid: boolean; error?: string } {
  // ファイルサイズチェック（2MB以下）
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    return { valid: false, error: "画像サイズは2MB以下にしてください" };
  }

  // ファイル形式チェック
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "JPEG、PNG、WebP形式の画像のみアップロード可能です" };
  }

  return { valid: true };
}
```

### UIコンポーネント設計

#### 1. ProfileEditForm

```typescript
// components/profile/ProfileEditForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileEditSchema } from "@/lib/validations";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function ProfileEditForm({ profile, email }: ProfileEditFormProps) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      display_name: profile.display_name || "",
      bio: profile.bio || "",
      interests: profile.interests || [],
    },
  });

  // 離脱警告
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // フォーム変更検知
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data) => {
    // 保存処理...
    setHasUnsavedChanges(false);
    router.push(`/profile/${profile.username}`);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <AvatarUploader currentAvatar={profile.avatar_url} />

      {/* 表示名 */}
      <Input {...form.register("display_name")} />

      {/* 自己紹介（文字数カウンター付き） */}
      <Textarea {...form.register("bio")} maxLength={200} />
      <p className="text-sm text-muted-foreground">
        {form.watch("bio")?.length || 0} / 200
      </p>

      {/* 興味タグ */}
      <TagSelector {...form.register("interests")} />

      {/* メールアドレス（表示のみ） */}
      <Input value={email} disabled className="bg-muted" />

      <Button type="submit" disabled={form.formState.isSubmitting}>
        保存
      </Button>
      <Button type="button" variant="outline" onClick={() => router.back()}>
        キャンセル
      </Button>
    </form>
  );
}
```

#### 2. AvatarUploader

```typescript
// components/profile/AvatarUploader.tsx
"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, X, Loader2 } from "lucide-react";

export function AvatarUploader({ currentAvatar, onUpload, onRemove }: AvatarUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // クライアントサイドバリデーション
    const validation = validateAvatarImage(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    // プレビュー表示
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // アップロード
    setIsUploading(true);
    await onUpload(file);
    setIsUploading(false);
  };

  const handleRemove = async () => {
    setPreview(null);
    await onRemove();
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-24 w-24">
        {preview ? (
          <AvatarImage src={preview} alt="Avatar preview" />
        ) : (
          <AvatarFallback>
            <Camera className="h-10 w-10" />
          </AvatarFallback>
        )}
      </Avatar>

      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              アップロード中...
            </>
          ) : (
            "画像を選択"
          )}
        </Button>

        {preview && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <X className="mr-2 h-4 w-4" />
            削除
          </Button>
        )}

        <p className="text-xs text-muted-foreground">
          JPEG、PNG、WebP（最大2MB）
        </p>
      </div>
    </div>
  );
}
```

### ページ構成

#### プロフィール編集ページ

```typescript
// app/(main)/profile/edit/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "プロフィール編集",
};

export default async function ProfileEditPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // メールアドレスを取得
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const email = authUser?.email || "";

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>プロフィール編集</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileEditForm profile={user} email={email} />
        </CardContent>
      </Card>
    </div>
  );
}
```

#### プロフィールページへの編集ボタン追加

```typescript
// app/(main)/profile/[username]/page.tsx（既存ファイルを更新）

// 自分のプロフィールの場合のみ編集ボタンを表示
{currentUser && currentUser.id === profile.id && (
  <Link href="/profile/edit">
    <Button variant="outline" size="sm">
      プロフィールを編集
    </Button>
  </Link>
)}
```

### セキュリティ考慮事項

1. **認証・認可**
   - すべてのServer Actionsで `getCurrentUser()` による認証チェック
   - 本人のプロフィールのみ編集可能

2. **入力バリデーション**
   - クライアントサイド: React Hook Form + Zod
   - サーバーサイド: Server Actions内で再バリデーション

3. **ファイルアップロード**
   - ファイル形式の検証（MIME type）
   - ファイルサイズの制限（2MB）
   - Supabase Storage RLSによるアクセス制御

4. **XSS対策**
   - ユーザー入力のサニタイゼーション
   - Next.jsの自動エスケープ機能を活用

### パフォーマンス最適化

1. **画像最適化**
   - アバター画像のリサイズ（推奨: 400x400px）
   - WebP形式の推奨
   - CDNキャッシュの活用（Supabase Storage）

2. **キャッシュ戦略**
   - `revalidatePath()` による適切なキャッシュ更新
   - プロフィールページと編集ページの両方を再検証

3. **楽観的UI更新**
   - アバターアップロード中のプレビュー表示
   - フォーム送信後の即座なリダイレクト

### テスト戦略

1. **単体テスト**
   - Server Actionsのテスト（`updateUserProfile`, `updateAvatar`, `removeAvatar`）
   - バリデーションスキーマのテスト
   - 画像ユーティリティ関数のテスト

2. **統合テスト**
   - プロフィール編集フローのE2Eテスト
   - 画像アップロード・削除のテスト
   - エラーハンドリングのテスト

3. **手動テスト項目**
   - 各フィールドのバリデーション
   - 離脱警告の動作確認
   - レスポンシブデザインの確認
   - ブラウザ互換性の確認

### 実装の段階的ロードマップ

#### Phase 5.1: インフラ準備（Task 43-44）
- Supabase Storageバケット設定
- 画像ユーティリティ関数の実装

#### Phase 5.2: バリデーションとServer Actions（Task 45-46）
- バリデーションスキーマの作成
- Server Actionsの実装

#### Phase 5.3: UIコンポーネント（Task 47-48）
- AvatarUploaderコンポーネント
- ProfileEditFormコンポーネント

#### Phase 5.4: ページ実装（Task 49-50）
- プロフィール編集ページ
- プロフィールページへの編集ボタン追加

#### Phase 5.5: UX向上（Task 51）
- 離脱警告の実装
- 楽観的UI更新
- トースト通知

#### Phase 5.6: テストとドキュメント（Task 52）
- 各種テストの実施
- ドキュメント整備