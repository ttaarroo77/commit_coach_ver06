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

  // 環境変数から取得
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://iwyztimustunsapozimt.supabase.co"
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3eXp0aW11c3R1bnNhcG96aW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MzgzNzIsImV4cCI6MjA2MDUxNDM3Mn0.XdAfEQNiMOZtcL8OF1KdcccDhtXJrO5J-fDlo_ozmLk"

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
  // 環境変数から取得
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://iwyztimustunsapozimt.supabase.co"
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3eXp0aW11c3R1bnNhcG96aW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MzgzNzIsImV4cCI6MjA2MDUxNDM3Mn0.XdAfEQNiMOZtcL8OF1KdcccDhtXJrO5J-fDlo_ozmLk"

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
