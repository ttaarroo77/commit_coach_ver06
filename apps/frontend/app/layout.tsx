import type React from "react"
import type { Metadata } from "next"
import { AuthProvider } from "@/context/auth-context"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "コミットコーチ - AIタスク管理アプリ",
  description: "AIコーチングでタスク管理を次のレベルへ",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
