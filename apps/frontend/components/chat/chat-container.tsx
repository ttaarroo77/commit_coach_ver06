"use client"

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Copy } from 'lucide-react';
import ChatMessage from './chat-message';
import ToneSelector from './tone-selector';
import { toast } from '@/components/ui/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatContainer() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tone, setTone] = useState<'friendly' | 'tough-love' | 'humor'>('friendly');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // メッセージ送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // ユーザーメッセージを追加
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // APIリクエスト
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
          tone,
        }),
      });

      if (!response.ok) {
        throw new Error('APIリクエストに失敗しました');
      }

      // ストリーミングレスポンスの処理
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('レスポンスボディの読み取りに失敗しました');
      }

      // 新しいアシスタントメッセージを作成
      const newAssistantMessage: Message = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, newAssistantMessage]);

      // ストリーミングデータの処理
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // デコードしてメッセージに追加
        const text = decoder.decode(value);
        setMessages(prev => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];
          if (lastMessage.role === 'assistant') {
            lastMessage.content += text;
          }
          return updated;
        });
      }
    } catch (error) {
      console.error('チャットAPIエラー:', error);
      // エラーメッセージを表示
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'すみません、エラーが発生しました。しばらくしてからもう一度お試しください。' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // メッセージをコピー
  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "コピーしました",
        description: "メッセージをクリップボードにコピーしました",
      });
    } catch (error) {
      console.error("コピーに失敗しました:", error);
      toast({
        title: "エラー",
        description: "メッセージのコピーに失敗しました",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-6rem)] bg-background">
      {/* トーンセレクター */}
      <div className="p-4 border-b">
        <ToneSelector value={tone} onChange={setTone} />
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
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="メッセージを入力..."
            className="resize-none min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
