"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export default function LoginCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = getSupabaseClient()
        const { error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        // 認証成功後、チャットページにリダイレクト
        router.push("/chat")
      } catch (error) {
        console.error("認証コールバックエラー:", error)
        router.push("/login")
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#31A9B8]" />
        <p className="text-gray-600">認証を処理中です...</p>
      </div>
    </div>
  )
}
