"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Send, Loader2, Copy, History } from "lucide-react";
import ChatMessage from "./chat-message";
// 将来実装予定のためコメントアウト
// import ToneSelector from "./tone-selector";
import { toast } from "sonner";
import { handleError } from "@/lib/error-utils";
import { getSupabaseClient } from "@/lib/supabase";
import { useChat } from "@/hooks/useChat";
import ChatHistory from "./chat-history";
import { ErrorBoundary } from "../error-boundary";

interface Message {
  role: "user" | "assistant" | "system";
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
      // 新しいエラーハンドリングユーティリティを使用して詳細なエラー情報と回復オプションを提供
      handleError(
        error, 
        error.message || 'チャット処理中にエラーが発生しました', 
        '再試行', 
        () => {
          // 入力内容があれば再度送信を試みる
          if (input.trim()) {
            submitChatMessage({ preventDefault: () => {} } as React.FormEvent);
          }
        }
      );
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
            .maybeSingle();

          if (error) {
            console.error(
              'プロファイル取得エラー:',
              error.message,
              error.details
            );
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
  }, [user?.id]); // useEffectの依存配列を最適化

  // 初回ロード時にウェルカムメッセージを表示 - 将来実装予定
  /* 
  useEffect(() => {
    if (messages.length === 0) {
      // NOTE: setMessagesは現在useChatフックに移行されているため、この部分は使用できません
      // 将来的にuseChatフックにデフォルトメッセージ機能を実装する必要があります
      // setMessages([
      //  {
      //    role: "assistant",
      //    content: `こんにちは${user?.email ? `、${user.email.split("@")[0]}さん` : ""}！コミットコーチです。プログラミングや開発に関する質問があれば、お気軽にどうぞ。何かお手伝いできることはありますか？`,
      //  },
      // ]);
    }
  }, [user, messages.length]);
  */

  // メッセージをコピーする関数
  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("メッセージをコピーしました");
    } catch (error) {
      // エラーハンドリングユーティリティを使用して再試行オプションを提供
      handleError(
        error, 
        "コピーに失敗しました", 
        "再試行", 
        () => handleCopyMessage(content)
      );
    }
  };

  // メッセージ送信処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      try {
        submitChatMessage(e); // useChatフックからの処理を呼び出す
      } catch (error) {
        // エラーハンドリングユーティリティを使用して詳細情報と復旧オプションを提供
        handleError(
          error, 
          "メッセージ送信に失敗しました", 
          "再試行", 
          () => handleSubmit(e)
        );
      }
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex h-full max-h-[calc(100vh-6rem)] bg-background"> 
        {/* 会話履歴サイドバー */}
        {showHistory && (
          <div className="w-64 border-r overflow-y-auto">
            <div className="p-3 border-b flex justify-between items-center">
              <h3 className="text-sm font-medium">会話履歴</h3>
              <button 
                onClick={() => setShowHistory(false)}
                className="h-7 w-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
              >
                <span className="sr-only">Close</span>
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <ChatHistory 
              currentConversationId={conversation?.id} 
              onSelectConversation={(id) => {
                loadConversation(id);
              }} 
            />
          </div>
        )}

      <ErrorBoundary>
        <div className="flex flex-col flex-1"> {/* .flex-col コンテナ */}
          {/* ヘッダー */}
          <div className="p-4 border-b flex justify-between items-center">
            {/* トーン選択コンポーネント - 将来実装予定 */}
            <h2 className="text-lg font-semibold">AIコーチと会話する</h2>
            
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="ml-2 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <History className="h-4 w-4 mr-1" />
              履歴
            </button>
          </div>
            onClick={() => setShowHistory(!showHistory)}
            className="ml-2 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <History className="h-4 w-4 mr-1" />
            履歴
          </button>
        </div>

        {/* メッセージエリア */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className="group relative">
              <ChatMessage message={message} />
              <button
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleCopyMessage(message.content)}
              >
                <Copy className="h-4 w-4" />
              </button>
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
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="メッセージを入力（Cmd/Ctrl+Enter で送信・Shift+Enter で改行）"
              className="resize-none overflow-y-auto flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#31A9B8] focus:border-transparent"
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
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-[#31A9B8] hover:bg-[#2a8f9c] text-white h-[80px] px-4 rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              title="送信 (Ctrl+Enter または Cmd+Enter)"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
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
    </ErrorBoundary>
  );
}
