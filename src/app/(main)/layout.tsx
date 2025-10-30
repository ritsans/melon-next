import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ヘッダー */}
      <Suspense fallback={<div className="h-16 border-b bg-white" />}>
        <Header />
      </Suspense>

      {/* メインコンテンツエリア */}
      <div className="flex flex-1">
        {/* サイドバー */}
        <Suspense fallback={<div className="w-64 border-r bg-neutral-50" />}>
          <Sidebar />
        </Suspense>

        {/* メインコンテンツ */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
