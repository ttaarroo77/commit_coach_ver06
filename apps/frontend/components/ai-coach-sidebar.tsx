// apps/frontend/components/ai-coach-sidebar.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Loader2,
  Copy,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { handleError } from "@/lib/error-utils";
import ChatMessage from "./chat/chat-message";
import ToneSelector from "./chat/tone-selector";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Cookies from "js-cookie";
import { isDemoModeEnabled } from "@/lib/demo-mode";

// React 19での型互換性問題を解決するためのタイプアサーション
const CollapsibleComponent = Collapsible as any;
const CollapsibleTriggerComponent = CollapsibleTrigger as any;
const CollapsibleContentComponent = CollapsibleContent as any;
const ButtonComponent = Button as any;
const TextareaComponent = Textarea as any;
const AlertComponent = Alert as any;
const AlertDescriptionComponent = AlertDescription as any;

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AICoachSidebarProps {
  defaultOpen?: boolean;
}

export const AICoachSidebar = ({
  defaultOpen = true,
}: AICoachSidebarProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tone, setTone] = useState<"friendly" | "tough-love" | "humor">(
    "friendly"
  );
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ---- デモモードの判定（環境変数 > Cookie） ----
  const [isDemoMode, setIsDemoMode] = useState(false);
  useEffect(() => {
    // 環境変数とCookieを考慮したデモモード判定
    setIsDemoMode(isDemoModeEnabled());
  }, []);

  // オートスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 初回ウェルカム
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: `こんにちは${
            user?.email ? `、${user.email.split("@")[0]}さん` : ""
          }！コミットコーチです。プログラミングや開発に関する質問があれば、お気軽にどうぞ。何かお手伝いできることはありますか？`,
        },
      ]);
    }
  }, [user, messages.length]);

  // クリップボード
  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("メッセージをコピーしました");
    } catch (err) {
      // 新しいエラーハンドリングユーティリティを使用
      handleError(
        err, 
        "コピーに失敗しました", 
        "再試行", 
        () => handleCopyMessage(content)
      );
    }
  };

  // ---------------------------
  // ★ GPT へ問い合わせる関数
  // ---------------------------
  const callChatApi = async (userMessage: string) => {
    // 最大 10 件 + 今回の user メッセージ
    const recentHistory = [...messages, { role: "user", content: userMessage }]
      .slice(-11)
      .map(({ role, content }) => ({ role, content }));

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tone,
        messages: recentHistory,
        // ★ システムプロンプトをここで注入（API 側で前置きしても OK）
        system_prompt: `You are CommitCoach, a seasoned software mentor. Answer in a ${tone} manner, mixing clear explanations with actionable next steps. Keep responses concise but supportive.`,
      }),
    });

    if (!res.ok || !res.body) {
      throw new Error("AI からの応答取得に失敗しました");
    }
    return res.body;
  };

  // ---------------------------
  // メッセージ送信
  // ---------------------------
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    // ユーザーメッセージを即時表示
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const stream = await callChatApi(userMessage);

      // 空の assistant メッセージを追加しつつストリーム更新
      let assistantContent = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      // GPT から NDJSON で `{ "content": "…" }` が届く想定
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // 改行ごとにパース
        let boundary = buffer.lastIndexOf("\n");
        if (boundary === -1) continue;
        const lines = buffer.slice(0, boundary).split("\n");
        buffer = buffer.slice(boundary + 1);

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const { content: chunk } = JSON.parse(line);
            assistantContent += chunk;
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last.role === "assistant") last.content = assistantContent;
              return updated;
            });
          } catch {
            // JSON パース失敗は無視して次へ
          }
        }
      }
    } catch (err) {
      // 新しいエラーハンドリングユーティリティを使用して詳細なエラー情報を表示
      handleError(
        err,
        "メッセージ送信に失敗しました",
        "再試行",
        () => {
          // ユーザーが再試行を選択した場合、入力を復元して再送信準備
          setInput(input);
        }
      );
      // エラー時: 直前の user メッセージを削除
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  // フォーム submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage();
  };

  return (
    <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
      <CollapsibleComponent
        open={isOpen}
        onOpenChange={setIsOpen}
        className="bg-white shadow-md rounded-lg border w-80 flex flex-col max-h-[calc(100vh-2rem)]"
      >
        <CollapsibleTriggerComponent asChild>
          <ButtonComponent
            variant="ghost"
            className="flex justify-between items-center w-full p-3 h-auto"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <span className="font-medium">AIコーチ</span>
              {isDemoMode && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  デモ
                </span>
              )}
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </ButtonComponent>
        </CollapsibleTriggerComponent>

        <CollapsibleContentComponent className="flex flex-col max-h-[calc(100vh-4rem)]">
          {/* ---- デモモード表示 ---- */}
          {isDemoMode && (
            <AlertComponent className="m-3 bg-yellow-50 text-yellow-800 border-yellow-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescriptionComponent className="text-xs font-medium">
                デモモード：応答はサンプルです
              </AlertDescriptionComponent>
            </AlertComponent>
          )}

          {/* ---- トーンセレクター ---- */}
          <div className="p-3 border-b">
            <ToneSelector value={tone} onChange={setTone} />
          </div>

          {/* ---- メッセージリスト ---- */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className="group relative">
                <div className="text-sm">
                  <ChatMessage message={m} />
                </div>
                <ButtonComponent
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                  onClick={() => handleCopyMessage(m.content)}
                >
                  <Copy className="h-3 w-3" />
                </ButtonComponent>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>考えています...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ---- 入力 ---- */}
          <form onSubmit={handleSubmit} className="p-3 border-t">
            <div className="flex items-end gap-2">
              <TextareaComponent
                ref={textareaRef}
                value={input}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                placeholder="質問を入力..."
                className="resize-none min-h-[60px] text-sm"
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                  // Ctrl/Cmd+Enter で送信
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    if (input.trim() && !isLoading) sendMessage();
                    return;
                  }
                  // Enter 単体: 何も起きない
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !e.metaKey &&
                    !e.ctrlKey
                  ) {
                    e.preventDefault();
                    return;
                  }
                  // Shift+Enter → 改行（デフォルト）
                }}
              />
              <ButtonComponent
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="h-[60px] w-10 bg-[#31A9B8] hover:bg-[#2a8f9c]"
                title="送信 (Ctrl+Enter または Cmd+Enter)"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </ButtonComponent>
            </div>

            {/* ---- キーバインド表示 (変更禁止) ---- */}
            <div className="text-xs text-gray-500 mt-2 flex flex-wrap gap-4">
              <span>
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">
                  Ctrl+Enter
                </kbd>{" "}
                または
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">
                  ⌘+Enter
                </kbd>{" "}
                で送信
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">
                  Shift+Enter
                </kbd>{" "}
                で改行
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">
                  Enter
                </kbd>{" "}
                単体では何も起きません
              </span>
            </div>
          </form>
        </CollapsibleContentComponent>
      </CollapsibleComponent>
    </div>
  );
};
