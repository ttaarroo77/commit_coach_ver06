"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { signOut, getCurrentUser } from "@/lib/auth"
import type { User } from "@supabase/supabase-js"
import Cookies from "js-cookie"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signInWithMagicLink: (email: string) => Promise<void>
  logout: () => Promise<void>
}

// デフォルト値を提供
const defaultContextValue: AuthContextType = {
  user: null,
  loading: true,
  error: null,
  signInWithMagicLink: async () => {},
  logout: async () => {},
}

const AuthContext = createContext<AuthContextType>(defaultContextValue)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)

    try {
      const supabase = getSupabaseClient()

      // 初期ロード時にユーザー情報を取得
      async function loadUser() {
        try {
          const currentUser = await getCurrentUser()
          setUser(currentUser || null)
        } catch (err) {
          console.error("ユーザー情報の取得に失敗しました", err)
        } finally {
          setLoading(false)
        }
      }

      // 認証状態の変更を監視
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      loadUser()

      return () => {
        subscription.unsubscribe()
      }
    } catch (err) {
      console.error("認証コンテキストの初期化エラー:", err)
      setLoading(false)
    }
  }, [router])

  // 日本語のエラーメッセージマッピング
  const authErrorMessages: Record<string, string> = {
    "Invalid login credentials": "メールアドレスまたはパスワードが正しくありません",
    "Email not confirmed": "メールアドレスが確認されていません。メールをご確認ください",
    "User already registered": "このメールアドレスは既に登録されています",
    "Email format is invalid": "メールアドレスの形式が正しくありません",
  }

  // Magic-Link認証処理
  const signInWithMagicLink = async (email: string) => {
    try {
      setError(null)
      setLoading(true)

      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/login/callback`,
        },
      })

      if (error) {
        throw error
      }
    } catch (err: any) {
      console.error("Magic-Link認証エラー:", err)
      const errorMessage = err.message ? authErrorMessages[err.message] || err.message : "認証リンクの送信に失敗しました"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // ログアウト処理
  const logout = async () => {
    try {
      setLoading(true)
      await signOut()
      setUser(null)
      router.push("/")
    } catch (err: any) {
      setError(err.message || "ログアウトに失敗しました")
      console.error("ログアウトエラー:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, signInWithMagicLink, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
