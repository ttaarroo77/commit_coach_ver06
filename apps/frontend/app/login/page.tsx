"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context" // Assuming this path is correct
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

// Demo credentials - consider moving to environment variables or a config file
const DEMO_EMAIL = "demo@example.com"
const DEMO_PASSWORD = "demopassword"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const auth = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (auth) {
      await auth.login(email, password)
    }
  }

  const handleDemoLogin = () => {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    // Optionally, auto-submit after setting demo credentials:
    // if (auth) {
    //   auth.login(DEMO_EMAIL, DEMO_PASSWORD);
    // }
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
            <CardTitle className="text-2xl text-center">ログイン</CardTitle>
            <CardDescription className="text-center">
              アカウントにログインしてください。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {auth?.error && (
                <Alert variant="destructive">
                  <AlertDescription>{auth.error}</AlertDescription>
                </Alert>
              )}
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
              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full bg-[#31A9B8] hover:bg-[#2a8f9c]" disabled={auth?.loading}>
                {auth?.loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ログイン中...
                  </>
                ) : (
                  "ログイン"
                )}
              </Button>
            </form>
            <Button variant="outline" className="w-full" onClick={handleDemoLogin} disabled={auth?.loading}>
              デモユーザーでログイン
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-2 pt-6">
            <Link href="/forget-password" className="text-sm text-[#31A9B8] hover:underline">パスワードをお忘れですか？</Link>
            <Link href="/register" className="text-sm text-[#31A9B8] hover:underline">新しいアカウントを作成</Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
