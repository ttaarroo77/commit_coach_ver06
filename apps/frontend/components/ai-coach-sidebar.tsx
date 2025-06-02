// apps/frontend/components/ai-coach-sidebar.tsx
"use client"

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Copy, MessageSquare, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getSupabaseClient } from '@/lib/supabase';
import ChatMessage from './chat/chat-message';
import ToneSelector from './chat/tone-selector';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Cookies from 'js-cookie';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AICoachSidebarProps {
  defaultOpen?: boolean
}

export const AICoachSidebar = ({ defaultOpen = true }: AICoachSidebarProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tone, setTone] = useState<'friendly' | 'tough-love' | 'humor'>('friendly');
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // デモモードの状態管理
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // クライアントサイドでのみCookieをチェック
  useEffect(() => {
    setIsDemoMode(Cookies.get("demo_mode") === "true");
  }, []);

  // メッセージ一覧を自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 初回ロード時にウェルカムメッセージを表示
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `こんにちは${user?.email ? `、${user.email.split('@')[0]}さん` : ''}！コミットコーチです。プログラミングや開発に関する質問があれば、お気軽にどうぞ。何かお手伝いできることはありますか？`
        }
      ]);
    }
  }, [user]);

  // メッセージをコピーする関数
  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("メッセージをコピーしました");
    } catch (error) {
      console.error('コピーに失敗しました:', error);
      toast.error("コピーに失敗しました");
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // ユーザーメッセージを追加
    const newUserMessage: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // デモモードの場合はダミー応答を返す
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 擬似的な待機時間

        const demoResponses = [
          "デモモードでのご利用ありがとうございます！実際のAIコーチでは、あなたの目標達成をサポートします。",
          "素晴らしい質問ですね！本サービスでは、AIがあなたのタスク管理を効率化し、生産性向上をお手伝いします。",
          "デモ版では制限がありますが、実際にはあなた専用のAIコーチがカスタマイズされたアドバイスを提供します。",
          "このような機能に興味をお持ちいただき、ありがとうございます！ぜひアカウント登録して、フル機能をお試しください。"
        ];

        const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
        const assistantMessage: Message = { role: 'assistant', content: randomResponse };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
        return;
      }

      // 通常のAPI呼び出し
      const supabase = getSupabaseClient();
      const response = await supabase.functions.invoke('chat', {
        body: {
          message: userMessage,
          tone: tone,
          conversation_history: messages.slice(-10) // 直近10件の履歴を送信
        }
      });

      if (response.error) {
        throw response.error;
      }

      const assistantMessage: Message = { role: 'assistant', content: response.data.message };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('チャット送信エラー:', error);
      toast.error("メッセージの送信に失敗しました");

      // エラー時はユーザーメッセージを削除
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  // メッセージ送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage();
  };

  return (
    <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <span className="font-medium">AIコーチ</span>
              {isDemoMode && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">デモ</span>
              )}
            </div>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col flex-1">
          {isDemoMode && (
            <Alert className="mx-4 mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                デモモードです。実際のAI応答は制限されています。
              </AlertDescription>
            </Alert>
          )}

          {/* トーンセレクター */}
          <div className="p-3 border-b">
            <ToneSelector value={tone} onChange={setTone} />
          </div>

          {/* メッセージエリア */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((message, index) => (
              <div key={index} className="group relative">
                <div className="text-sm">
                  <ChatMessage message={message} />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                  onClick={() => handleCopyMessage(message.content)}
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

          {/* 入力エリア */}
          <form onSubmit={handleSubmit} className="p-3 border-t">
            <div className="flex items-end gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                // placeholder="質問を入力... (Shift+Enter または Cmd+Enter で改行)"
                placeholder="質問を入力... (Shift+Enter で改行)"

                className="resize-none min-h-[60px] text-sm"
                onKeyDown={(e) => {
                  // Shift+Enter または Cmd+Enter (Mac) / Ctrl+Enter (Windows) で改行
                  if (e.key === 'Enter' && (e.shiftKey || e.metaKey || e.ctrlKey)) {
                    // デフォルトの改行動作を許可
                    return;
                  }

                  // 普通のEnterで送信
                  if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
                    e.preventDefault();
                    if (input.trim() && !isLoading) {
                      sendMessage();
                    }
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="h-[60px] w-10 bg-[#31A9B8] hover:bg-[#2a8f9c]"
                title="送信 (Enter)"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>

            {/* <p className="text-xs text-gray-500 mt-2"> */}
              {/* <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> 送信　 */}
              {/* <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Shift+Enter</kbd> 改行 */}
            {/* </p> */}

          </form>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
