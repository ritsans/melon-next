"use server";

import { redirect } from "next/navigation";

import type { LoginFormData, SignupFormData, ForgotPasswordFormData, ResetPasswordFormData } from "./validations";
import { createClient } from "@/lib/supabase/server";

/**
 * ログイン処理
 * @param data - ログインフォームデータ
 * @returns 成功時はnull、エラー時はエラーメッセージ
 */
export async function login(data: LoginFormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { error: "メールアドレスまたはパスワードが正しくありません" };
  }

  redirect("/");
}

/**
 * サインアップ処理
 * @param data - サインアップフォームデータ
 * @returns 成功時はnull、エラー時はエラーメッセージ
 */
export async function signup(data: SignupFormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { error: "アカウントの作成に失敗しました" };
  }

  redirect("/");
}

/**
 * ログアウト処理
 */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * 現在のユーザー情報を取得
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * プロフィール情報を取得
 * @param userId - ユーザーID
 */
export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();

  if (error) {
    return null;
  }

  return data;
}

/**
 * パスワードリセットメール送信
 * @param data - パスワード忘れフォームデータ
 * @returns 成功時はnull、エラー時はエラーメッセージ
 */
export async function forgotPassword(data: ForgotPasswordFormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });

  if (error) {
    return { error: "パスワードリセットメールの送信に失敗しました" };
  }

  return null;
}

/**
 * パスワード再設定処理
 * @param data - パスワード再設定フォームデータ
 * @returns 成功時はnull、エラー時はエラーメッセージ
 */
export async function resetPassword(data: ResetPasswordFormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: data.password,
  });

  if (error) {
    return { error: "パスワードの再設定に失敗しました" };
  }

  redirect("/login");
}
