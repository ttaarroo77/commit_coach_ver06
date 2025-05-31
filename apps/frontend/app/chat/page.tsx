import { Metadata } from 'next';
import ChatContainer from '@/components/chat/chat-container';
import { AuthGuard } from '@/components/auth-guard';

export const metadata: Metadata = {
  title: 'チャット | Commit Coach',
  description: 'AIコミットコーチとチャットして、開発に関するアドバイスを得ましょう。',
};

export default function ChatPage() {
  return (
    <AuthGuard>
      <div className="container h-[calc(100vh-4rem)] py-6">
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <h1 className="text-2xl font-bold">AIコミットコーチ</h1>
            <p className="text-muted-foreground">
              プログラミングや開発に関する質問をしてみましょう。コミットコーチがサポートします。
            </p>
          </div>
          
          <div className="flex-1 overflow-hidden rounded-lg border">
            <ChatContainer />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
