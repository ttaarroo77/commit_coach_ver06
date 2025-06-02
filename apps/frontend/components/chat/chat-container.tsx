"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Copy } from "lucide-react";
import ChatMessage from "./chat-message";
import ToneSelector from "./tone-selector";
import { toast } from "sonner";
import { getSupabaseClient } from "@/lib/supabase";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatContainer() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tone, setTone] = useState<"friendly" | "tough-love" | "humor">(
    "friendly"
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // メッセージ一覧を自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ユーザープロファイルからトーン設定を取得
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const supabase = getSupabaseClient();
          const { data, error } = await supabase
            .from('profiles')
            .select('tone')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('プロファイル取得エラー:', error);
            return;
          }

          // トーン設定があれば適用
          if (data?.tone) {
            setTone(data.tone as 'friendly' | 'tough-love' | 'humor');
          }
        } catch (error) {
          console.error('プロファイル取得中にエラーが発生しました:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  // 初回ロード時にウェルカムメッセージを表示
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: `こんにちは${user?.email ? `、${user.email.split("@")[0]}さん` : ""}！コミットコーチです。プログラミングや開発に関する質問があれば、お気軽にどうぞ。何かお手伝いできることはありますか？`,
        },
      ]);
    }
  }, [user, messages.length]);

  // メッセージをコピーする関数
  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("メッセージをコピーしました");
    } catch (error) {
      console.error("コピーに失敗しました:", error);
      toast.error("コピーに失敗しました");
    }
  };

  // メッセージ送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // ユーザーメッセージを追加
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // AbortControllerの設定（30秒タイムアウト）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      toast.error("AIが応答に時間がかかっています。後で再試行してください。");
    }, 30000); // 30秒

    try {
      // Supabaseセッション取得
      const supabase = getSupabaseClient();
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("認証セッションが無効です");
      }

      // APIリクエスト
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({
            role,
            content,
          })),
          tone,
        }),
        signal: controller.signal, // AbortControllerのシグナルを設定
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "APIリクエストに失敗しました");
      }

      // ストリーミングレスポンスの処理
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("レスポンスボディの読み取りに失敗しました");
      }

      // 新しいアシスタントメッセージを作成
      const newAssistantMessage: Message = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, newAssistantMessage]);

      // ストリーミングデータの処理
      const decoder = new TextDecoder();
      let continueReading = true;
      while (continueReading) {
        const { done, value } = await reader.read();
        if (done) {
          continueReading = false;
          break;
        }

        // デコードしてメッセージに追加
        const text = decoder.decode(value);
        setMessages((prev) => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];
          if (lastMessage.role === "assistant") {
            lastMessage.content += text;
          }
          return updated;
        });
      }
    } catch (error) {
      console.error("チャットエラー:", error);
      
      // AbortErrorの場合はタイムアウトメッセージを表示済みなのでスキップ
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        toast.error(
          error instanceof Error
            ? error.message
            : "チャットでエラーが発生しました"
        );
      }

      // エラー時は最後に追加したアシスタントメッセージを削除
      setMessages((prev) => {
        const updated = [...prev];
        if (
          updated[updated.length - 1]?.role === "assistant" &&
          updated[updated.length - 1]?.content === ""
        ) {
          updated.pop();
        }
        return updated;
      });
    } finally {
      // タイマーをクリア
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-6rem)] bg-background">
      {/* トーンセレクター */}
      <div className="p-4 border-b">
        <ToneSelector value={tone} onChange={(newTone) => {
          // トーン変更を適用
          setTone(newTone);
          
          // トーン設定をプロファイルに保存
          if (user?.id) {
            const saveToneToProfile = async () => {
              try {
                const supabase = getSupabaseClient();
                const { error } = await supabase
                  .from('profiles')
                  .upsert({
                    id: user.id,
                    tone: newTone,
                    updated_at: new Date().toISOString()
                  });

                if (error) {
                  console.error('トーン設定の保存エラー:', error);
                  toast.error('トーン設定の保存に失敗しました');
                } else {
                  toast.success('トーン設定を保存しました');
                }
              } catch (error) {
                console.error('トーン設定の保存中にエラーが発生しました:', error);
                toast.error('トーン設定の保存に失敗しました');
              }
            };

            saveToneToProfile();
          }
        }} />
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className="group relative">
            <ChatMessage message={message} />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleCopyMessage(message.content)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>コーチが回答を考えています...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            // placeholder="質問を入力... (Shift+Enter または Cmd+Enter で改行)"
            placeholder="質問を入力... (Shift+Enter で改行)"
            className="resize-none"
            rows={3}
            onKeyDown={(e) => {
              // Shift+Enter または Cmd+Enter (Mac) / Ctrl+Enter (Windows) で改行
              if (e.key === "Enter" && (e.shiftKey || e.metaKey || e.ctrlKey)) {
                // デフォルトの改行動作を許可
                return;
              }

              // 普通のEnterで送信
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.metaKey &&
                !e.ctrlKey
              ) {
                e.preventDefault();
                if (input.trim() && !isLoading) {
                  handleSubmit(e);
                }
              }
            }}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-[#31A9B8] hover:bg-[#2a8f9c]"
            title="送信 (Enter)"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* <p className="text-xs text-gray-500 mt-2">
          <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> 
          送信　
          <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">
            Shift+Enter
          </kbd> 
          改行
        </p> */}

      </form>
    </div>
  );
}
