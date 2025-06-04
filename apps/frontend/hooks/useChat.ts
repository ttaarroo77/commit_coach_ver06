import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';

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
  conversationId: string | undefined;
  setConversationId: (conversationId: string | undefined) => void;
  conversations: Conversation[];
  isLoadingConversations: boolean;
  loadConversationsList: () => Promise<void>;
  deleteConversation: (id: string) => Promise<boolean>;
};

const API_BASE = '/api';

export function useChat({
  projectId,
  conversationId: initialConversationId,
  onError
}: UseChatOptions = {}): UseChatResult {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  // エラータイプに応じたメッセージを取得する関数
  const getErrorMessage = (error: any, defaultMessage: string): string => {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return 'ネットワーク接続に問題があります。インターネット接続を確認してください。';
    }
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        return '認証エラーが発生しました。再ログインしてください。';
      } else if (error.message.includes('403')) {
        return 'このリソースへのアクセス権がありません。';
      } else if (error.message.includes('404')) {
        return '会話が見つかりませんでした。削除されたか移動した可能性があります。';
      } else if (error.message.includes('500')) {
        return 'サーバーエラーが発生しました。しばらく経ってから再試行してください。';
      }
      return error.message;
    }
    
    return defaultMessage;
  };
  
  // 会話を読み込む関数
  const loadConversation = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/chat/conversations/${id}`);
      if (!response.ok) {
        throw new Error(`会話の読み込みに失敗しました (${response.status})`);
      }
      const data = await response.json();
      setConversation(data);
      setMessages(data.messages || []);
      return data;
    } catch (error) {
      console.error('Error loading conversation:', error);
      const errorMessage = getErrorMessage(error, '会話の読み込み中にエラーが発生しました');
      toast({
        title: '読み込みエラー',
        description: errorMessage,
        variant: 'destructive',
      });
      if (onError) onError(error as Error);
      throw error;
    }
  }, [onError, toast]);

  // 会話履歴を読み込む
  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId).catch(error => {
        console.error('Failed to load conversation:', error);
        if (onError) onError(error as Error);
      });
    }
  }, [conversationId, loadConversation, onError]);

  // 会話リストを取得する関数
  const loadConversations = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/chat/conversations`);
      if (!response.ok) {
        throw new Error(`会話リストの読み込みに失敗しました (${response.status})`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error loading conversations:', error);
      const errorMessage = getErrorMessage(error, '会話リストの取得中にエラーが発生しました');
      toast({
        title: '会話リスト読み込みエラー',
        description: errorMessage,
        variant: 'destructive',
      });
      if (onError) onError(error as Error);
      throw error;
    }
  }, [onError, toast]);
  
  // 会話リストを読み込み状態に保存する関数
  const loadConversationsList = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      const data = await loadConversations();
      setConversations(data);
    } catch (error) {
      console.error('会話リスト読み込みエラー:', error);
      const errorMessage = getErrorMessage(error, '会話リストの読み込みに失敗しました。後ほど再試行してください。');
      toast({
        title: '会話リスト読み込みエラー',
        description: errorMessage,
        variant: 'destructive',
      });
      if (onError) onError(error as Error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [loadConversations, onError, toast]);
  
  // 会話削除関数
  const deleteConversation = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/chat/conversations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`会話の削除に失敗しました (${response.status})`);
      }

      toast({
        title: '成功',
        description: '会話が削除されました',
      });
      
      // 削除した会話が現在表示している会話なら、クリア
      if (conversationId === id) {
        setConversationId(undefined);
        setConversation(null);
        setMessages([]);
      }
      
      return true;
    } catch (error) {
      console.error('会話削除エラー:', error);
      toast({
        title: '会話の削除に失敗しました',
        description: '後ほど再試行してください',
        variant: 'destructive',
      });
      if (onError) onError(error as Error);
      return false;
    }
  }, [conversationId, onError, toast, setConversationId, setConversation, setMessages]);
  
  // コンポーネントのアンマウント時に中断処理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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

      // タイムアウト処理の設定
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const timeoutId = setTimeout(() => {
        controller.abort();
        toast({
          title: 'タイムアウト',
          description: 'レスポンスが時間内に返ってきませんでした。後ほど再試行してください。',
          variant: 'destructive',
        });
      }, 30000); // 30秒でタイムアウト

      // Server-Sent Eventsを使用してストリーミングレスポンスを受信
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      // タイムアウトタイマーをクリア
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // レスポンスヘッダーから会話IDを取得
      const newConversationId = response.headers.get('X-Conversation-Id');
      if (newConversationId && !conversationId) {
        setConversationId(newConversationId);
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
      const errorMessage = getErrorMessage(
        error, 
        'メッセージ送信中にエラーが発生しました。後ほど再試行してください。'
      );
      toast({
        title: '送信エラー',
        description: errorMessage,
        variant: 'destructive',
      });
      if (onError) onError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, conversation, conversationId, projectId, onError, loadConversation, loadConversations, toast]);

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
    conversationId,
    setConversationId,
    conversations,
    isLoadingConversations,
    loadConversationsList,
    deleteConversation
  };
}
