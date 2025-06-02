import { useState, useCallback, useEffect } from 'react';

type Message = {
  id?: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  createdAt?: Date;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
};

type UseChatOptions = {
  projectId?: string;
  conversationId?: string;
  onError?: (error: Error) => void;
};

type UseChatResult = {
  messages: Message[];
  input: string;
  setInput: (input: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  conversation: Conversation | null;
  setConversation: (conversation: Conversation | null) => void;
  loadConversation: (id: string) => Promise<void>;
  loadConversations: () => Promise<Conversation[]>;
};

const API_BASE = '/api';

export function useChat({
  projectId,
  conversationId,
  onError
}: UseChatOptions = {}): UseChatResult {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);

  // 会話履歴を読み込む
  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId).catch(error => {
        console.error('Failed to load conversation:', error);
        if (onError) onError(error);
      });
    }
  }, [conversationId]);

  // 会話を読み込む関数
  const loadConversation = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/chat/conversations/${id}`);
      if (!response.ok) {
        throw new Error('Failed to load conversation');
      }
      const data = await response.json();
      setConversation(data);
      setMessages(data.messages);
      return data;
    } catch (error) {
      console.error('Error loading conversation:', error);
      if (onError) onError(error as Error);
      throw error;
    }
  }, [onError]);

  // 会話リストを取得する関数
  const loadConversations = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/chat/conversations`);
      if (!response.ok) {
        throw new Error('Failed to load conversations');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error loading conversations:', error);
      if (onError) onError(error as Error);
      throw error;
    }
  }, [onError]);

  // メッセージ送信処理
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // 現在の入力をクリア
    const userMessage = input;
    setInput('');
    setIsLoading(true);

    // ユーザーメッセージをUI上で即時表示
    const newUserMessage: Message = {
      content: userMessage,
      role: 'user',
    };
    
    setMessages(prev => [...prev, newUserMessage]);

    try {
      // APIリクエスト用のパラメータ
      const requestBody = {
        message: userMessage,
        conversationId: conversation?.id,
        projectId,
      };

      // Server-Sent Eventsを使用してストリーミングレスポンスを受信
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      // 新しいアシスタントメッセージを作成
      const assistantMessage: Message = {
        content: '',
        role: 'assistant',
      };
      setMessages(prev => [...prev, assistantMessage]);

      // チャンクを読み込む
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (done) break;

        // デコードしたテキストを解析
        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              
              if (data.content) {
                // アシスタントのメッセージを更新
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content += data.content;
                  }
                  return newMessages;
                });
              }
              
              if (data.done) {
                done = true;
                break;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }

      // 会話が存在しない場合は最新の会話を読み込む
      if (!conversation?.id) {
        const conversations = await loadConversations();
        if (conversations.length > 0) {
          await loadConversation(conversations[0].id);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      if (onError) onError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, conversation, projectId, onError, loadConversation, loadConversations]);

  return {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    conversation,
    setConversation,
    loadConversation,
    loadConversations,
  };
}
