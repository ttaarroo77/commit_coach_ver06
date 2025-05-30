// apps/frontend/app/logout/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // TODO: Implement actual logout logic here (e.g., clear tokens, etc.)
    
    // リダイレクトする前に少し待機して、ログアウト中のメッセージを表示
    const redirectTimer = setTimeout(() => {
      router.push('/');
    }, 1500); // 1.5秒後にリダイレクト

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">ログアウト中...</h1>
      <p className="text-gray-600">ログアウトが完了しました。ホームページにリダイレクトします。</p>
    </div>
  );
}
