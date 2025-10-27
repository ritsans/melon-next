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
  display_name: z
    .string()
    .max(50, "表示名は50文字以下で入力してください")
    .optional(),
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
  content: z
    .string()
    .min(1, "投稿内容を入力してください")
    .max(500, "投稿は500文字以下で入力してください"),
  tag: z.string().min(1, "タグを選択してください"),
});

export type PostFormData = z.infer<typeof postSchema>;
