/**
 * dashboard-utils.ts
 * ------------------
 * Utility helpers used by the Ver 0 "dashboard" (MyPage) components.
 * Scope is limited to:
 *   • 認証済みユーザーの取得
 *   • 直近チャットメッセージの読み書き
 *   • トーンプリセット (profiles.tone) の取得・更新
 *
 * NOTE: No Todo‐related logic here — that arrives in Ver 1.
 */

import { createBrowserClient, SupabaseClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";
import Cookies from "js-cookie";
import { isDemoModeEnabled } from "./demo-mode";

// ---------- Supabase Singleton ---------- //

let _client: SupabaseClient<Database> | undefined;

/**
 * Obtain a typed Supabase browser client (singleton).
 */
export function supabase(): SupabaseClient<Database> {
  if (_client) return _client;

  // デモモードのチェック（環境変数 > Cookie）
  const demoMode = typeof window !== "undefined" ? isDemoModeEnabled() : false;

  // デモモードの場合はダミークライアントを返す
  if (demoMode) {
    console.log("デモモード: Supabaseダミークライアントを使用します");
    _client = createBrowserClient<Database>("https://example.supabase.co", "dummy-key");
    return _client;
  }

  // 環境変数を取得
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 環境変数が設定されていない場合のエラーハンドリング
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase環境変数が設定されていません。ダミークライアントを使用します。");
    // ダミークライアントを返す（エラーを投げない）
    _client = createBrowserClient<Database>("https://example.supabase.co", "dummy-key");
    return _client;
  }

  _client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return _client;
}

// ---------- Types ---------- //

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  created_at: string; // ISO
}

// ---------- Auth ---------- //

/**
 * Return the current auth session (throws if none).
 */
export async function requireSession() {
  // デモモードのチェック
  if (typeof window !== "undefined" && Cookies.get("demo_mode") === "true") {
    return {
      user: {
        id: "demo-user-id",
        email: "demo@example.com"
      }
    };
  }

  const { data, error } = await supabase().auth.getSession();
  if (error || !data.session) throw new Error("Unauthenticated");
  return data.session;
}

// ---------- Chat Helpers ---------- //

/**
 * Fetch the most recent chat messages for the signed‑in user.
 */
export async function fetchRecentMessages(limit = 10): Promise<ChatMessage[]> {
  try {
    const session = await requireSession();

    // デモモードの場合はダミーデータを返す
    if (typeof window !== "undefined" && Cookies.get("demo_mode") === "true") {
      return [
        {
          id: "demo-1",
          role: "user",
          content: "こんにちは！",
          created_at: new Date().toISOString()
        },
        {
          id: "demo-2",
          role: "assistant",
          content: "こんにちは！何かお手伝いできることはありますか？",
          created_at: new Date().toISOString()
        }
      ];
    }

    const { data, error } = await supabase()
      .from("messages")
      .select("id, role, content, created_at")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as ChatMessage[];
  } catch (error) {
    console.warn("メッセージの取得に失敗しました:", error);
    return [];
  }
}

/**
 * Insert a new chat message (user or AI).
 */
export async function insertMessage(role: ChatRole, content: string) {
  try {
    const session = await requireSession();

    // デモモードの場合は何もしない
    if (typeof window !== "undefined" && Cookies.get("demo_mode") === "true") {
      console.log("デモモード: メッセージの保存をスキップします");
      return;
    }

    const { error } = await supabase()
      .from("messages")
      .insert({ user_id: session.user.id, role, content });

    if (error) throw error;
  } catch (error) {
    console.warn("メッセージの保存に失敗しました:", error);
  }
}

// ---------- Tone Preset ---------- //

export type TonePreset = "friendly" | "tough-love" | "humor";

/**
 * Get the saved tone preset for the current user (default "friendly").
 */
export async function getTone(): Promise<TonePreset> {
  try {
    const session = await requireSession();

    // デモモードの場合はデフォルト値を返す
    if (typeof window !== "undefined" && Cookies.get("demo_mode") === "true") {
      return "friendly";
    }

    const { data, error } = await supabase()
      .from("profiles")
      .select("tone")
      .eq("id", session.user.id)
      .single();

    if (error && error.code !== "PGRST116") throw error; // row not found = ignore
    return (data?.tone as TonePreset) ?? "friendly";
  } catch (error) {
    console.warn("トーン設定の取得に失敗しました:", error);
    return "friendly";
  }
}

/**
 * Update the user tone preset.
 */
export async function setTone(tone: TonePreset) {
  try {
    const session = await requireSession();

    // デモモードの場合は何もしない
    if (typeof window !== "undefined" && Cookies.get("demo_mode") === "true") {
      console.log("デモモード: トーン設定の保存をスキップします");
      return;
    }

    const { error } = await supabase()
      .from("profiles")
      .upsert({ id: session.user.id, tone }, { onConflict: "id" });

    if (error) throw error;
  } catch (error) {
    console.warn("トーン設定の保存に失敗しました:", error);
  }
}

// ---------- Misc ---------- //

/**
 * Simple sleep helper – useful for optimistic UI demos.
 */
export const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------- Export functions for API routes ---------- //

export async function getDashboardData() {
  try {
    const messages = await fetchRecentMessages(10);
    const tone = await getTone();
    return { messages, tone };
  } catch (error) {
    console.warn("ダッシュボードデータの取得に失敗しました:", error);
    return { messages: [], tone: "friendly" as TonePreset };
  }
}

export async function saveDashboardData(data: { tone?: TonePreset }) {
  try {
    if (data.tone) {
      await setTone(data.tone);
    }
  } catch (error) {
    console.warn("ダッシュボードデータの保存に失敗しました:", error);
  }
}
