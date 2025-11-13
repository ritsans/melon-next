import { z } from "zod";

/**
 * ログインフォームのバリデーションスキーマ
 */
export const loginSchema = z.object({
  email: z.string().email("正しいメールアドレスを入力してください"),
  password: z.string().min(6, "パスワードは6文字以上で入力してください"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * サインアップフォームのバリデーションスキーマ
 */
export const signupSchema = z
  .object({
    email: z.string().email("正しいメールアドレスを入力してください"),
    password: z.string().min(6, "パスワードは6文字以上で入力してください"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

/**
 * オンボーディングフォームのバリデーションスキーマ
 */
export const onboardingSchema = z.object({
  username: z
    .string()
    .min(3, "ユーザー名は3文字以上で入力してください")
    .max(20, "ユーザー名は20文字以下で入力してください")
    .regex(/^[a-zA-Z0-9_]+$/, "英数字とアンダースコアのみ使用可能です"),
  display_name: z.string().max(15, "表示名は15文字以下で入力してください").optional(),
  bio: z.string().max(200, "自己紹介は200文字以下で入力してください").optional(),
  interests: z
    .array(z.string())
    .min(1, "興味のある分野を1つ以上選択してください")
    .max(5, "興味のある分野は5つまで選択可能です"),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

/**
 * 投稿フォームのバリデーションスキーマ
 */
export const postSchema = z.object({
  content: z.string().min(1, "投稿内容を入力してください").max(500, "投稿は500文字以下で入力してください"),
  tags: z
    .array(
      z
        .string()
        .min(1, "タグを入力してください")
        .max(20, "タグは20文字以下にしてください")
        .regex(/^[a-z0-9_-]+$/i, "タグは英数字・ハイフン・アンダースコアのみ使用できます"),
    )
    .min(1, "タグを1つ以上選択してください")
    .max(5, "タグは5つまで選択可能です"),
});

export type PostFormData = z.infer<typeof postSchema>;

/**
 * パスワード忘れフォームのバリデーションスキーマ
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email("正しいメールアドレスを入力してください"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * パスワード再設定フォームのバリデーションスキーマ
 */
export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "パスワードは6文字以上で入力してください"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * プロフィール編集フォームのバリデーションスキーマ
 */
export const profileEditSchema = z.object({
  display_name: z.string().min(1, "表示名は必須です").max(50, "表示名は50文字以内で入力してください"),
  bio: z.string().max(200, "自己紹介は200文字以内で入力してください").optional().or(z.literal("")),
  interests: z.array(z.string()).optional(),
  avatar: z
    .instanceof(File)
    .refine((file) => file.size <= 2 * 1024 * 1024, "画像サイズは2MB以下にしてください")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "JPEG、PNG、WebP形式の画像のみアップロード可能です",
    )
    .optional(),
});

export type ProfileEditFormData = z.infer<typeof profileEditSchema>;
