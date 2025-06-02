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
import ChatMessage from "./chat/chat-message";
import ToneSelector from "./chat/tone-selector";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Cookies from "js-cookie";

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

  // ---- デモモードの判定（Cookie に demo_mode=true が入っていればオン） ----
  const [isDemoMode, setIsDemoMode] = useState(false);
  useEffect(() => {
    setIsDemoMode(Cookies.get("demo_mode") === "true");
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
      console.error("コピーに失敗:", err);
      toast.error("コピーに失敗しました");
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
      console.error("チャット送信エラー:", err);
      toast.error("メッセージ送信に失敗しました");
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
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* ---- 見出し ---- */}
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto">
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
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="flex flex-col flex-1">
          {/* ---- デモ警告 ---- */}
          {isDemoMode && (
            <Alert className="mx-4 mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                デモモードです。応答は実際の OpenAI API を通じて生成されていますが、
                コンテンツやトークン量に制限がある可能性があります。
              </AlertDescription>
            </Alert>
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                  onClick={() => handleCopyMessage(m.content)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
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
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="質問を入力..."
                className="resize-none min-h-[60px] text-sm"
                onKeyDown={(e) => {
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
              <Button
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
              </Button>
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};



// // apps/frontend/components/ai-coach-sidebar.tsx
// 以下、アップデート前のファイル：

// "use client"

// import { useState, useRef, useEffect } from 'react';
// import { useAuth } from '@/context/auth-context';
// import { Button } from '@/components/ui/button';
// import { Textarea } from '@/components/ui/textarea';
// import { Send, Loader2, Copy, MessageSquare, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
// import { toast } from 'sonner';
// import { getSupabaseClient } from '@/lib/supabase';
// import ChatMessage from './chat/chat-message';
// import ToneSelector from './chat/tone-selector';
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import Cookies from 'js-cookie';

// interface Message {
//   role: 'user' | 'assistant';
//   content: string;
// }

// interface AICoachSidebarProps {
//   defaultOpen?: boolean
// }

// export const AICoachSidebar = ({ defaultOpen = true }: AICoachSidebarProps) => {
//   const { user } = useAuth();
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [tone, setTone] = useState<'friendly' | 'tough-love' | 'humor'>('friendly');
//   const [isOpen, setIsOpen] = useState(defaultOpen);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);

//   // デモモードの状態管理
//   const [isDemoMode, setIsDemoMode] = useState(false);

//   // クライアントサイドでのみCookieをチェック
//   useEffect(() => {
//     setIsDemoMode(Cookies.get("demo_mode") === "true");
//   }, []);

//   // メッセージ一覧を自動スクロール
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // 初回ロード時にウェルカムメッセージを表示
//   useEffect(() => {
//     if (messages.length === 0) {
//       setMessages([
//         {
//           role: 'assistant',
//           content: `こんにちは${user?.email ? `、${user.email.split('@')[0]}さん` : ''}！コミットコーチです。プログラミングや開発に関する質問があれば、お気軽にどうぞ。何かお手伝いできることはありますか？`
//         }
//       ]);
//     }
//   }, [user]);

//   // メッセージをコピーする関数
//   const handleCopyMessage = async (content: string) => {
//     try {
//       await navigator.clipboard.writeText(content);
//       toast.success("メッセージをコピーしました");
//     } catch (error) {
//       console.error('コピーに失敗しました:', error);
//       toast.error("コピーに失敗しました");
//     }
//   };

//   const sendMessage = async () => {
//     if (!input.trim() || isLoading) return;

//     const userMessage = input.trim();
//     setInput('');

//     // ユーザーメッセージを追加
//     const newUserMessage: Message = { role: 'user', content: userMessage };
//     setMessages(prev => [...prev, newUserMessage]);
//     setIsLoading(true);

//     try {
//       // デモモードの場合は簡易的な会話応答を返す
//       if (isDemoMode) {
//         await new Promise(resolve => setTimeout(resolve, 1000)); // 擬似的な待機時間

//         let response = "";
//         // 「しりとり」に関連する質問かチェック
//         if (userMessage.includes("しりとり")) {
//           response = "しりとりですね！「りんご」から始めましょう。";
//         }
//         // 「りんご」の場合
//         else if (userMessage.includes("りんご")) {
//           response = "「ごりら」で続けます！";
//         }
//         // 「ごりら」の場合
//         else if (userMessage.includes("ごりら")) {
//           response = "「らっぱ」で続けます！";
//         }
//         // 「らっぱ」の場合
//         else if (userMessage.includes("らっぱ")) {
//           response = "「パンダ」で続けます！";
//         }
//         // デフォルトの応答
//         else {
//           const demoResponses = [
//             "こんにちは！テスト用のデモモードです。具体的な質問をしていただくと、それに応じた返答を試みます。",
//             "テスト会話モードです。「しりとり」と入力すると、しりとりゲームができます。",
//             "会話のテスト中ですね。何かお手伝いできることはありますか？",
//             "テスト会話に参加していただき、ありがとうございます。簡単な応答ですが、質問に答えられるよう努めています。"
//           ];
//           response = demoResponses[Math.floor(Math.random() * demoResponses.length)];
//         }

//         const assistantMessage: Message = { role: 'assistant', content: response };
//         setMessages(prev => [...prev, assistantMessage]);
//         setIsLoading(false);
//         return;
//       }

//       // 通常のAPI呼び出し
//       const supabase = getSupabaseClient();
//       const response = await supabase.functions.invoke('chat', {
//         body: {
//           message: userMessage,
//           tone: tone,
//           conversation_history: messages.slice(-10) // 直近10件の履歴を送信
//         }
//       });

//       if (response.error) {
//         throw response.error;
//       }

//       const assistantMessage: Message = { role: 'assistant', content: response.data.message };
//       setMessages(prev => [...prev, assistantMessage]);
//     } catch (error) {
//       console.error('チャット送信エラー:', error);
//       toast.error("メッセージの送信に失敗しました");

//       // エラー時はユーザーメッセージを削除
//       setMessages(prev => prev.slice(0, -1));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // メッセージ送信処理
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     await sendMessage();
//   };

//   return (
//     <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
//       <Collapsible open={isOpen} onOpenChange={setIsOpen}>
//         <CollapsibleTrigger asChild>
//           <Button
//             variant="ghost"
//             className="w-full justify-between p-4 h-auto"
//           >
//             <div className="flex items-center gap-2">
//               <MessageSquare className="h-5 w-5" />
//               <span className="font-medium">AIコーチ</span>
//               {isDemoMode && (
//                 <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">デモ</span>
//               )}
//             </div>
//             {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
//           </Button>
//         </CollapsibleTrigger>
//         <CollapsibleContent className="flex flex-col flex-1">
//           {isDemoMode && (
//             <Alert className="mx-4 mb-4">
//               <AlertCircle className="h-4 w-4" />
//               <AlertDescription className="text-sm">
//                 デモモードです。実際のAI応答は制限されています。
//               </AlertDescription>
//             </Alert>
//           )}

//           {/* トーンセレクター */}
//           <div className="p-3 border-b">
//             <ToneSelector value={tone} onChange={setTone} />
//           </div>

//           {/* メッセージエリア */}
//           <div className="flex-1 overflow-y-auto p-3 space-y-3">
//             {messages.map((message, index) => (
//               <div key={index} className="group relative">
//                 <div className="text-sm">
//                   <ChatMessage message={message} />
//                 </div>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
//                   onClick={() => handleCopyMessage(message.content)}
//                 >
//                   <Copy className="h-3 w-3" />
//                 </Button>
//               </div>
//             ))}
//             {isLoading && (
//               <div className="flex items-center gap-2 text-muted-foreground text-sm">
//                 <Loader2 className="h-4 w-4 animate-spin" />
//                 <span>考えています...</span>
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>

//           {/* 入力エリア */}
//           <form onSubmit={handleSubmit} className="p-3 border-t">
//             <div className="flex items-end gap-2">
//               <Textarea
//                 ref={textareaRef}
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 // placeholder="質問を入力... (Shift+Enter または Cmd+Enter で改行)"
//                 placeholder="質問を入力..."

//                 className="resize-none min-h-[60px] text-sm"
//                 onKeyDown={(e) => {
//                   // Ctrl/Cmd+Enter で送信
//                   if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
//                     e.preventDefault();
//                     if (input.trim() && !isLoading) {
//                       sendMessage();
//                     }
//                     return;
//                   }

//                   // Enter 単体: 何も起きない（デフォルト動作を防止）
//                   if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
//                     e.preventDefault();  // デフォルトの改行動作を防止
//                     return;
//                   }

//                   // Shift+Enter は改行（デフォルトを残す）
//                 }}
//               />
//               <Button
//                 type="submit"
//                 size="icon"
//                 disabled={isLoading || !input.trim()}
//                 className="h-[60px] w-10 bg-[#31A9B8] hover:bg-[#2a8f9c]"
//                 title="送信 (Ctrl+Enter または Cmd+Enter)"
//               >
//                 {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
//               </Button>
//             </div>

//             <div className="text-xs text-gray-500 mt-2 flex flex-wrap gap-4">
//               <span>
//                 <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Ctrl+Enter</kbd> または
//                 <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">⌘+Enter</kbd> で送信
//               </span>
//               <span>
//                 <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Shift+Enter</kbd> で改行
//               </span>
//               <span>
//                 <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Enter</kbd> 単体では何も起きません
//               </span>
//             </div>

//           </form>
//         </CollapsibleContent>
//       </Collapsible>
//     </div>
//   );
// };
