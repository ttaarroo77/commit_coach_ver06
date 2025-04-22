import { createClient } from "@supabase/supabase-js"

// シングルトンパターンでクライアントを作成（クライアントサイド用）
let supabaseClient: ReturnType<typeof createClient> | null = null

const validateSupabaseConfig = (url: string, key: string) => {
  try {
    new URL(url)
  } catch (error) {
    throw new Error(`無効なSupabase URLです: ${url}`)
  }

  if (!key || key.length < 20) {
    throw new Error(`無効なSupabaseキーです: ${key}`)
  }
}

export const getSupabaseClient = () => {
  if (supabaseClient) return supabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase環境変数が設定されていません。.env.localファイルを確認してください。")
  }

  validateSupabaseConfig(supabaseUrl, supabaseAnonKey)

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })

  return supabaseClient
}

// サーバーサイド用のクライアント
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase環境変数が設定されていません。.env.localファイルを確認してください。")
  }

  validateSupabaseConfig(supabaseUrl, supabaseAnonKey)

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  })
}
