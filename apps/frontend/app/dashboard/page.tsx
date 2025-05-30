"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// apps/frontend/app/dashboard/page.tsx
export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // /projects ページに自動的にリダイレクト
    router.replace("/projects")
  }, [])

  // リダイレクト中に表示する内容（一瞬だけ表示される）
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">リダイレクト中...</h1>
        <p>プロジェクト一覧ページに移動しています</p>
      </div>
    </div>
  )
}
