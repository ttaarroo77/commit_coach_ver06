"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChatMessage, TonePreset, fetchRecentMessages, getTone, setTone, supabase } from "@/lib/dashboard-utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"

export default function MyPage() {
  const [tone, setTonePreset] = useState<TonePreset>("friendly")
  const [isLoadingTone, setIsLoadingTone] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)
  const [userEmail, setUserEmail] = useState<string>("")

  // トーンプリセットを取得
  /* 
  // 将来実装のためコメントアウト
  useEffect(() => {
    const loadTone = async () => {
      try {
        const currentTone = await getTone()
        setTonePreset(currentTone)
      } catch (error) {
        console.error("トーンプリセットの取得に失敗しました", error)
      } finally {
        setIsLoadingTone(false)
      }
    }

    loadTone()
  }, [])
  */
  
  // 仮の実装として単にローディング状態を解除
  useEffect(() => {
    setIsLoadingTone(false)
  }, [])

  // 直近のチャットメッセージを取得
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const recentMessages = await fetchRecentMessages(10)
        setMessages(recentMessages)
        
        // ユーザーセッションからメールアドレスを取得
        try {
          const { data: { session } } = await supabase().auth.getSession()
          if (session?.user?.email) {
            setUserEmail(session.user.email)
          }
        } catch (e) {
          console.error("ユーザー情報の取得に失敗しました", e)
        }
      } catch (error) {
        console.error("メッセージの取得に失敗しました", error)
      } finally {
        setIsLoadingMessages(false)
      }
    }

    loadMessages()
  }, [])

  // トーンプリセットを変更
  /* 
  // 将来実装のためコメントアウト
  const handleToneChange = async (value: string) => {
    try {
      const newTone = value as TonePreset
      setTonePreset(newTone)
      await setTone(newTone)
      toast({
        title: "トーンプリセットを更新しました",
        description: `AIコーチのトーンを「${getToneLabel(newTone)}」に変更しました`,
      })
    } catch (error) {
      console.error("トーンプリセットの更新に失敗しました", error)
      toast({
        title: "エラー",
        description: "トーンプリセットの更新に失敗しました",
        variant: "destructive",
      })
    }
  }
  */
  
  // UIデモ用の暫定実装
  const handleToneChange = (value: string) => {
    const newTone = value as TonePreset
    setTonePreset(newTone)
    toast({
      title: "トーンプリセットを更新しました（デモ）",
      description: `AIコーチのトーンを「${getToneLabel(newTone)}」に変更しました（実際の保存は将来実装予定）`,
    })
  }

  // トーンプリセットのラベルを取得
  const getToneLabel = (tone: TonePreset): string => {
    switch (tone) {
      case "friendly":
        return "フレンドリー"
      case "tough-love":
        return "厳格"
      case "humor":
        return "ユーモア"
      default:
        return "フレンドリー"
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex flex-1 overflow-auto p-6">
          <div className="w-full max-w-4xl">
            <h1 className="mb-6 text-2xl font-bold">マイページ</h1>
            <div className="space-y-6">
              {/* アカウント情報カード */}
              <Card>
                <CardHeader>
                  <CardTitle>アカウント情報</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src="" alt="プロフィール画像" />
                        <AvatarFallback className="text-2xl">
                          {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full p-0"
                      >
                        +
                      </Button>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">メールアドレス</Label>
                        <Input id="email" type="email" value={userEmail} disabled />
                        <p className="text-xs text-gray-500">Magic Linkログインで使用されるメールアドレスです</p>
                      </div>
                      
                      {/* トーンプリセット選択 - 将来実装のためコメントアウト
                      <div className="space-y-2">
                        <Label htmlFor="tone">AIコーチのトーン</Label>
                        {isLoadingTone ? (
                          <Skeleton className="h-10 w-full" />
                        ) : (
                          <Select value={tone} onValueChange={handleToneChange}>
                            <SelectTrigger id="tone">
                              <SelectValue placeholder="トーンを選択" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="friendly">フレンドリー</SelectItem>
                              <SelectItem value="tough-love">厳格</SelectItem>
                              <SelectItem value="humor">ユーモア</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        <p className="text-xs text-gray-500">AIコーチの話し方や指導スタイルを設定します</p>
                      </div>
                      */}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 直近のチャット履歴カード */}
              <Card>
                <CardHeader>
                  <CardTitle>直近のチャット履歴</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingMessages ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div key={message.id} className="flex items-start space-x-3 rounded-lg border p-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {message.role === "user" ? "U" : "AI"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">
                                {message.role === "user" ? "あなた" : "AIコーチ"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(message.created_at), {
                                  addSuffix: true,
                                  locale: ja,
                                })}
                              </p>
                            </div>
                            <p className="mt-1 text-sm line-clamp-2">{message.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">チャット履歴がありません</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
