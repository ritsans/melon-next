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