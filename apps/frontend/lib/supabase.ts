import { createClient } from "@supabase/supabase-js"

// シングルトンパターンでクライアントを作成（クライアントサイド用）
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (supabaseClient) return supabaseClient

  // 環境変数を取得
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 環境変数が設定されていない場合のエラーハンドリング
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase環境変数が設定されていません。")
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "commit_coach_auth",
      storage: {
        getItem: (key) => {
          if (typeof window === "undefined") return null
          const value = window.localStorage.getItem(key)
          return value ? JSON.parse(value) : null
        },
        setItem: (key, value) => {
          if (typeof window === "undefined") return
          window.localStorage.setItem(key, JSON.stringify(value))
        },
        removeItem: (key) => {
          if (typeof window === "undefined") return
          window.localStorage.removeItem(key)
        },
      },
    },
  })

  return supabaseClient
}

// サーバーサイド用のクライアント
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase環境変数が設定されていません。")
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  })
}
