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

// ---------- Supabase Singleton ---------- //

let _client: SupabaseClient<Database> | undefined;

/**
 * Obtain a typed Supabase browser client (singleton).
 */
export function supabase(): SupabaseClient<Database> {
  if (!_client) {
    _client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _client;
}

// ---------- Types ---------- //

export type ChatRole = "user" | "ai";

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
  const { data, error } = await supabase().auth.getSession();
  if (error || !data.session) throw new Error("Unauthenticated");
  return data.session;
}

// ---------- Chat Helpers ---------- //

/**
 * Fetch the most recent chat messages for the signed‑in user.
 */
export async function fetchRecentMessages(limit = 10): Promise<ChatMessage[]> {
  const session = await requireSession();

  const { data, error } = await supabase()
    .from("messages")
    .select("id, role, content, created_at")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as ChatMessage[];
}

/**
 * Insert a new chat message (user or AI).
 */
export async function insertMessage(role: ChatRole, content: string) {
  const session = await requireSession();

  const { error } = await supabase()
    .from("messages")
    .insert({ user_id: session.user.id, role, content });

  if (error) throw error;
}

// ---------- Tone Preset ---------- //

export type TonePreset = "friendly" | "tough-love" | "humor";

/**
 * Get the saved tone preset for the current user (default "friendly").
 */
export async function getTone(): Promise<TonePreset> {
  const session = await requireSession();

  const { data, error } = await supabase()
    .from("profiles")
    .select("tone")
    .eq("user_id", session.user.id)
    .single();

  if (error && error.code !== "PGRST116") throw error; // row not found = ignore
  return (data?.tone as TonePreset) ?? "friendly";
}

/**
 * Update the user tone preset.
 */
export async function setTone(tone: TonePreset) {
  const session = await requireSession();

  const { error } = await supabase()
    .from("profiles")
    .upsert({ user_id: session.user.id, tone }, { onConflict: "user_id" });

  if (error) throw error;
}

// ---------- Misc ---------- //

/**
 * Simple sleep helper – useful for optimistic UI demos.
 */
export const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
