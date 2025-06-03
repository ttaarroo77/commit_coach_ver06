"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = getSupabaseClient()
        
        // URLパラメータからエラーをチェック
        const errorCode = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        if (errorCode) {
          setStatus('error')
          setErrorMessage(errorDescription || 'ログインリンクが無効または期限切れです')
          toast.error('認証に失敗しました')
          
          // 3秒後にログインページにリダイレクト
          setTimeout(() => {
            router.push('/login')
          }, 3000)
          return
        }
        
        // セッションを取得して認証状態を確認
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (data?.session) {
          // 認証成功
          setStatus('success')
          toast.success('ログインに成功しました！')
          
          // 1秒後にプロジェクトページにリダイレクト
          setTimeout(() => {
            router.push('/projects')
          }, 1000)
        } else {
          // セッションがない場合
          throw new Error('セッションが見つかりませんでした')
        }
      } catch (error: any) {
        console.error('認証コールバックエラー:', error)
        setStatus('error')
        setErrorMessage(error.message || '認証処理中にエラーが発生しました')
        toast.error('認証に失敗しました')
        
        // 3秒後にログインページにリダイレクト
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4 p-8 bg-white rounded-lg shadow-sm max-w-md w-full">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-[#31A9B8]" />
            <h2 className="text-xl font-medium text-gray-800">認証を処理中です</h2>
            <p className="text-gray-600 text-center">Magic Linkによるログイン処理を行っています。しばらくお待ちください...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <h2 className="text-xl font-medium text-gray-800">認証に成功しました</h2>
            <p className="text-gray-600 text-center">プロジェクトページに移動します...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-500" />
            <h2 className="text-xl font-medium text-gray-800">認証に失敗しました</h2>
            <p className="text-gray-600 text-center">{errorMessage}</p>
            <p className="text-sm text-gray-500">ログインページに戻ります...</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function LoginCallbackPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4 p-8 bg-white rounded-lg shadow-sm max-w-md w-full">
          <Loader2 className="h-12 w-12 animate-spin text-[#31A9B8]" />
          <h2 className="text-xl font-medium text-gray-800">読み込み中...</h2>
        </div>
      </div>
    }>
      <CallbackContent />
    </React.Suspense>
  )
}
