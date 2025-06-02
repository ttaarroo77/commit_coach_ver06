"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Play, Mail } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState(false)
  const [linkSent, setLinkSent] = useState(false)
  const auth = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (auth && email.trim()) {
      try {
        setIsLoading(true)
        await auth.signInWithMagicLink(email)
        setLinkSent(true)
        toast.success("ログインリンクを送信しました！メールをご確認ください。")
      } catch (error) {
        toast.error("ログインリンクの送信に失敗しました。")
      } finally {
        setIsLoading(false)
      }
    }
  }

  // デモモードでログイン
  const handleDemoLogin = async () => {
    try {
      setIsDemoLoading(true)

      // デモモードのクッキーを設定
      Cookies.set("demo_mode", "true", { expires: 1 }) // 1日間有効

      toast.success("デモモードでログインしました！")

      // デモモードのプロジェクトページにリダイレクト
      router.push("/projects")
    } catch (error) {
      toast.error("デモモードの開始に失敗しました。")
    } finally {
      setIsDemoLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#31A9B8] text-white">C</div>
            <span className="text-xl font-semibold">コミットコーチ</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {linkSent ? "メールをご確認ください" : "ログイン"}
            </CardTitle>
            <CardDescription className="text-center">
              {linkSent
                ? "ログインリンクを記載したメールを送信しました"
                : "メールアドレスを入力してログインリンクを受け取ってください"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!linkSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {auth?.error && (
                  <Alert variant="destructive">
                    <AlertDescription>{auth.error}</AlertDescription>
                  </Alert>
                )}

                {/* メールアドレス */}
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <Button type="submit" className="w-full bg-[#31A9B8] hover:bg-[#2a8f9c]" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      リンク送信中...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      ログインリンクを送信
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800">
                    <Mail className="inline-block mr-2 h-5 w-5" />
                    <span className="align-middle">{email} 宛にログインリンクを送信しました</span>
                  </p>
                  <p className="text-sm text-blue-600 mt-2">メールボックスをご確認ください</p>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setLinkSent(false)}
                >
                  別のメールアドレスで試す
                </Button>
              </div>
            )}

            {/* デモモードセクション */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-xs text-gray-500">または</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-[#31A9B8] text-[#31A9B8] hover:bg-[#31A9B8] hover:text-white"
              onClick={handleDemoLogin}
              disabled={isDemoLoading || auth?.loading}
            >
              {isDemoLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  デモ開始中...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  デモモードで体験する
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              デモモードでは、アカウント登録なしでアプリの機能をお試しいただけます
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <p className="text-xs text-gray-500 text-center">
              ログインリンクをクリックすると、新規ユーザーの場合は自動的にアカウントが作成されます
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
