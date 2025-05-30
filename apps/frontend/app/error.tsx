"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // エラーをログに記録
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 text-6xl font-bold text-red-500">エラー</div>
        <h2 className="mb-4 text-2xl font-semibold">予期せぬエラーが発生しました</h2>
        <p className="mb-8 text-gray-600">
          申し訳ありませんが、問題が発生しました。もう一度お試しいただくか、
          しばらく経ってからアクセスしてください。
        </p>
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 justify-center">
          <Button
            onClick={reset}
            className="bg-[#31A9B8] hover:bg-[#2a8f9c]"
          >
            再試行する
          </Button>
          <Button asChild variant="outline">
            <Link href="/projects">プロジェクト一覧に戻る</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
