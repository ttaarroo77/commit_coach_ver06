import { getSupabaseClient } from "./supabase"

// Magic-Link認証処理
export async function signInWithMagicLink(email: string) {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login/callback`,
      },
    })

    if (error) {
      console.error("Magic-Link認証エラー:", error.message)
      throw error
    }
  } catch (error) {
    console.error("認証エラー:", error)
    throw error
  }
}

// ログアウト処理
export async function signOut() {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error("ログアウトエラー:", error)
    throw error
  }
}

// 現在のユーザー情報を取得
export async function getCurrentUser() {
  try {
    const supabase = getSupabaseClient()
    const { data } = await supabase.auth.getUser()
    return data.user
  } catch (error) {
    console.error("ユーザー情報取得エラー:", error)
    return null
  }
}
