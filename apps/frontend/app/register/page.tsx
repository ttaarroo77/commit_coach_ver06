"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

// デモユーザーの認証情報
const DEMO_EMAIL = "demo@example.com"
const DEMO_PASSWORD = "demopassword"
const DEMO_NAME = "デモユーザー"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const auth = useAuth() // Initialize useAuth here

  // クライアントサイドでのみ実行される処理
  useEffect(() => {
    setMounted(true)

    // デモモードのクッキーが存在する場合はクリア
    if (Cookies.get("demo_mode") === "true") {
      // デモモードのクッキーをクリア
      Cookies.remove("demo_mode")
      // ページをリロードして認証状態をリセット
      window.location.reload()
    }
  }, [])

  // useAuthはクライアントサイドでマウント後にのみ使用
  // const auth = mounted ? useAuth() : { register: async () => {}, loading: false, error: null }

  // クライアントサイドでのみレンダリング
  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">読み込み中...</div>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    // パスワード確認
    if (password !== confirmPassword) {
      setValidationError("パスワードが一致しません")
      return
    }

    // パスワード強度チェック
    if (password.length < 8) {
      setValidationError("パスワードは8文字以上である必要があります")
      return
    }

    try {
      await auth.register(email, password, name)
      setSuccess(true)
    } catch (error) {
      // エラーは useAuth 内で処理されるため、ここでは何もしない
    }
  }

  // デモモードでログイン処理を行う関数
  const handleDemoLogin = async () => {
    setName(DEMO_NAME)
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    setConfirmPassword(DEMO_PASSWORD)
    
    // デモモードのクッキーを設定
    Cookies.set("demo_mode", "true", { expires: 1 }) // 1日間有効
    
    try {
      await auth.login(DEMO_EMAIL, DEMO_PASSWORD)
      router.push("/projects")
    } catch (error) {
      // エラーは useAuth 内で処理されるため、ここでは何もしない
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
            <CardTitle className="text-2xl text-center">新規登録</CardTitle>
            <CardDescription className="text-center">アカウント情報を入力して登録してください</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">
                    登録が完了しました！メールアドレスの確認メールをお送りしました。
                  </AlertDescription>
                </Alert>
                <p className="text-sm text-gray-600 text-center">メールを確認して、アカウントを有効化してください。</p>
                <Button className="w-full bg-[#31A9B8] hover:bg-[#2a8f9c]" onClick={() => router.push("/projects")}>
                  ダッシュボードへ進む
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {(auth.error || validationError) && (
                  <Alert variant="destructive">
                    <AlertDescription>{validationError || auth.error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="name">お名前</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="山田 太郎"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">パスワード</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">8文字以上の英数字を入力してください</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">パスワード（確認）</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-[#31A9B8] hover:bg-[#2a8f9c]" disabled={auth.loading}>
                  {auth.loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      登録中...
                    </>
                  ) : (
                    "新規登録"
                  )}
                </Button>
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-xs text-gray-500">または</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={handleDemoLogin} disabled={auth.loading}>
                  デモユーザーでログイン
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              すでにアカウントをお持ちの方は
              <Link href="/login" className="text-[#31A9B8] hover:underline ml-1">
                ログイン
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
