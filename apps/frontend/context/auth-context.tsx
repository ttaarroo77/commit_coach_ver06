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
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithMagicLink: (email: string) => Promise<void>
  logout: () => Promise<void>
}

// デフォルト値を提供
const defaultContextValue: AuthContextType = {
  user: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signUp: async () => {},
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
      // デモモードのチェック
      const isDemoMode = Cookies.get("demo_mode") === "true"

      if (isDemoMode) {
        // デモユーザーを設定
        const demoUser = {
          id: "demo-user-id",
          email: "demo@example.com",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          app_metadata: {},
          user_metadata: {},
          aud: "demo",
          confirmation_sent_at: null,
          confirmed_at: null,
          email_confirmed_at: null,
          identities: [],
          last_sign_in_at: null,
          phone: null,
          phone_confirmed_at: null,
          recovery_sent_at: null,
          role: "authenticated"
        } as User

        setUser(demoUser)
        setLoading(false)
        return
      }

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

        // ログイン成功時にリダイレクト
        if (event === 'SIGNED_IN' && session?.user) {
          router.push('/projects')
        }
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
    "Password should be at least 6 characters": "パスワードは6文字以上で入力してください",
    "Signup requires a valid password": "有効なパスワードが必要です",
  }

  // Email/Password認証（サインイン）
  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)

      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        setUser(data.user)
        router.push('/projects')
      }
    } catch (err: any) {
      console.error("ログインエラー:", err)
      const errorMessage = err.message ? authErrorMessages[err.message] || err.message : "ログインに失敗しました"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Email/Password認証（サインアップ）
  const signUp = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)

      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login/callback`,
        }
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // メール確認が必要な場合とそうでない場合を処理
        if (data.user.email_confirmed_at) {
          setUser(data.user)
          router.push('/projects')
        } else {
          // メール確認が必要な場合
          setError("確認メールを送信しました。メールをご確認の上、リンクをクリックしてください。")
        }
      }
    } catch (err: any) {
      console.error("サインアップエラー:", err)
      const errorMessage = err.message ? authErrorMessages[err.message] || err.message : "アカウント作成に失敗しました"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
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

      // デモモードのクッキーをクリア
      if (Cookies.get("demo_mode") === "true") {
        Cookies.remove("demo_mode")
        setUser(null)
        router.push("/")
        return
      }

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
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      signIn,
      signUp,
      signInWithMagicLink,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
