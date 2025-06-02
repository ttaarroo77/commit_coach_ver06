"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const auth = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (auth) {
      try {
        await auth.signInWithMagicLink(email)
        toast.success("認証リンクを送信しました。メールをご確認ください。")
      } catch (error) {
        toast.error("認証リンクの送信に失敗しました。")
      }
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
            <CardTitle className="text-2xl text-center">ログイン</CardTitle>
            <CardDescription className="text-center">
              メールアドレスを入力して、認証リンクを受け取ってください。
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
              <Button type="submit" className="w-full bg-[#31A9B8] hover:bg-[#2a8f9c]" disabled={auth?.loading}>
                {auth?.loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    送信中...
                  </>
                ) : (
                  "認証リンクを送信"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
