import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Melon - コミュニティ投稿プラットフォーム",
  description: "感情ベースのリアクションとタグで繋がる、軽量SNSプラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
