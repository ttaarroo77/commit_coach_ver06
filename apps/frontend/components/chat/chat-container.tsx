"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Copy, History } from "lucide-react";
import ChatMessage from "./chat-message";
import ToneSelector from "./tone-selector";
import { toast } from "sonner";
import { getSupabaseClient } from "@/lib/supabase";
import { useChat } from "@/hooks/useChat";
import ChatHistory from "./chat-history";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatContainer() {
  const { user } = useAuth();
  const [isComposing, setIsComposing] = useState(false); // IME composition guard
  const [tone, setTone] = useState<"friendly" | "tough-love" | "humor">(
    "friendly"
  );
  const [showHistory, setShowHistory] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>();
  
  const {
    messages,
    input,
    setInput,
    handleSubmit: submitChatMessage,
    isLoading,
    conversation,
    setConversation,
    loadConversation,
    loadConversations
  } = useChat({
    projectId: currentProjectId,
    onError: (error) => {
      toast.error(error.message || 'チャット処理中にエラーが発生しました');
    }
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null); // テキストエリアへの参照

  // テキストエリアの高さを動的に調整
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const max = Math.floor(window.innerHeight * 0.5); // 50vh
    el.style.height = Math.min(el.scrollHeight, max) + "px";
  }, [input]);

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
    
    // トーンをシステムプロンプトの一部として扱えるように設定
    // TODO: 将来的にはuseChatフックにtoneを渡せるようにする
    
    await submitChatMessage(e);
  };

  return (
    <div className="flex h-full max-h-[calc(100vh-6rem)] bg-background">
      {/* 会話履歴サイドバー */}
      {showHistory && (
        <div className="w-64 border-r overflow-y-auto">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="text-sm font-medium">会話履歴</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowHistory(false)}
              className="h-7 w-7"
            >
              <span className="sr-only">Close</span>
              <span aria-hidden="true">&times;</span>
            </Button>
          </div>
          <ChatHistory 
            currentConversationId={conversation?.id} 
            onSelectConversation={(id) => {
              loadConversation(id);
            }} 
          />
        </div>
      )}

      <div className="flex flex-col flex-1">
        {/* ヘッダー */}
        <div className="p-4 border-b flex justify-between items-center">
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
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="ml-2"
          >
            <History className="h-4 w-4 mr-1" />
            履歴
          </Button>
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
            placeholder="メッセージを入力（Cmd/Ctrl+Enter で送信・Shift+Enter で改行）"
            className="resize-none overflow-y-auto"
            rows={1}
            onKeyDown={(e) => {
              // ---- IME 中なら何もしない ----
              if (isComposing) return;

              // Ctrl/Cmd+Enter で送信
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (input.trim() && !isLoading) handleSubmit(e);
                return;
              }

              // Enter 単体: 何も起きない（デフォルト動作を防止）
              if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
                e.preventDefault();  // デフォルトの改行動作を防止
                return;
              }

              // Shift+Enter は改行（デフォルトを残す）
            }}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            ref={textareaRef}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-[#31A9B8] hover:bg-[#2a8f9c] h-[80px]"
            title="送信 (Ctrl+Enter または Cmd+Enter)"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground mt-2 flex flex-wrap gap-4">
          <span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Ctrl+Enter</kbd> または
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">⌘+Enter</kbd> で送信
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Shift+Enter</kbd> で改行
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Enter</kbd> 単体では何も起きません
          </span>
        </div>
      </form>
    </div>
  );
}
