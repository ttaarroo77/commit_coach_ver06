import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
  };
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg p-4',
        isUser ? 'bg-muted/50' : 'bg-background'
      )}
    >
      {/* アバター */}
      <Avatar className={cn(
        'h-8 w-8 border',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-blue-100 text-blue-600'
      )}>
        <div className="flex h-full w-full items-center justify-center">
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </div>
      </Avatar>

      {/* メッセージ内容 */}
      <div className="flex-1 space-y-2">
        <div className="font-medium">
          {isUser ? 'あなた' : 'コミットコーチ'}
        </div>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown
            components={{
              pre: ({ node, ...props }) => (
                <div className="overflow-auto rounded-lg bg-muted p-2 my-2">
                  <pre {...props} />
                </div>
              ),
              code: ({ node, inline, ...props }) => (
                inline ? 
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm" {...props} /> :
                <code className="font-mono text-sm" {...props} />
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
