import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type Conversation = {
  id: string;
  title: string;
  createdAt: string;
  projectId?: string;
};

type ChatHistoryProps = {
  currentConversationId?: string;
  onSelectConversation?: (id: string) => void;
};

export default function ChatHistory({
  currentConversationId,
  onSelectConversation,
}: ChatHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadConversations() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/chat/conversations');
        
        if (!response.ok) {
          throw new Error('会話履歴の取得に失敗しました');
        }
        
        const data = await response.json();
        setConversations(data);
        setError(null);
      } catch (err) {
        console.error('Error loading conversations:', err);
        setError('会話履歴の読み込み中にエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    }

    loadConversations();
  }, []);

  if (isLoading) {
    return <div className="p-4 text-gray-500">読み込み中...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (conversations.length === 0) {
    return <div className="p-4 text-gray-500">会話履歴がありません</div>;
  }

  return (
    <div className="space-y-2 p-2">
      <h3 className="font-semibold text-sm mb-3 px-2">会話履歴</h3>
      <ul className="space-y-1">
        {conversations.map((conversation) => (
          <li key={conversation.id}>
            {onSelectConversation ? (
              <button
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  currentConversationId === conversation.id
                    ? 'bg-gray-200 dark:bg-gray-700'
                    : ''
                }`}
              >
                {conversation.title}
              </button>
            ) : (
              <Link
                href={`/chat/${conversation.id}`}
                className={`block px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  currentConversationId === conversation.id
                    ? 'bg-gray-200 dark:bg-gray-700'
                    : ''
                }`}
              >
                {conversation.title}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
