import type React from "react"
import type { Metadata, Viewport } from "next"
import { AuthProvider } from "@/context/auth-context"
import { Toaster } from "sonner"
import "./globals.css"

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#31A9B8'
}

export const metadata: Metadata = {
  title: "Commit Coach - AIタスク管理・コミット支援アプリ",
  description: "AIコーチングでタスク管理とコミットメッセージ作成を効率化。開発者のための次世代タスク管理ツール。",
  generator: 'Next.js',
  applicationName: 'Commit Coach',
  authors: [{ name: '中澤 太郎', url: 'https://github.com/ttaarroo77' }],
  keywords: ['AI', 'タスク管理', 'コミット', '開発者ツール', 'プロジェクト管理'],
  creator: '中澤 太郎',
  publisher: '中澤 太郎',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://commit-coach.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Commit Coach - AIタスク管理・コミット支援アプリ',
    description: 'AIコーチングでタスク管理とコミットメッセージ作成を効率化。開発者のための次世代タスク管理ツール。',
    url: 'https://commit-coach.vercel.app',
    siteName: 'Commit Coach',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Commit Coach - AIタスク管理・コミット支援アプリ',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Commit Coach - AIタスク管理・コミット支援アプリ',
    description: 'AIコーチングでタスク管理とコミットメッセージ作成を効率化。開発者のための次世代タスク管理ツール。',
    images: ['/og-image.png'],
    creator: '@ttaarroo77',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/apple-touch-icon-precomposed.png',
    },
  },
  manifest: '/site.webmanifest',
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
