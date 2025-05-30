import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="mb-4 text-9xl font-bold text-[#31A9B8]">404</h1>
        <h2 className="mb-6 text-3xl font-semibold">ページが見つかりません</h2>
        <p className="mb-8 text-lg text-gray-600">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Button asChild className="bg-[#31A9B8] hover:bg-[#2a8f9c]">
          <Link href="/projects">プロジェクト一覧に戻る</Link>
        </Button>
      </div>
    </div>
  )
}
