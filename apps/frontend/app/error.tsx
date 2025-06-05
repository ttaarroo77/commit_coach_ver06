"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertTriangle, ArrowLeft, RefreshCw, Home } from "lucide-react"
import { getErrorType, getFriendlyErrorMessage, getErrorHelp } from "@/lib/error-utils"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [errorInfo, setErrorInfo] = useState({
    type: 'unknown',
    title: '予期せぬエラーが発生しました',
    message: '',
    help: '',
  });

  useEffect(() => {
    // エラーをログに記録
    console.error('アプリケーションエラー:', error);
    
    // エラー情報を分析して適切なメッセージを設定
    const errorType = getErrorType(error);
    const message = getFriendlyErrorMessage(error);
    const help = getErrorHelp(errorType);
    
    let title = '予期せぬエラーが発生しました';
    
    // エラータイプに応じたタイトルを設定
    switch(errorType) {
      case 'auth':
        title = '認証エラーが発生しました';
        break;
      case 'network':
        title = 'ネットワークエラーが発生しました';
        break;
      case 'api':
        title = 'サーバー通信エラーが発生しました';
        break;
      case 'validation':
        title = '入力内容に問題があります';
        break;
    }
    
    setErrorInfo({
      type: errorType,
      title,
      message,
      help,
    });
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white dark:bg-gray-900 p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
            <AlertTriangle className="h-10 w-10 text-red-500 dark:text-red-400" />
          </div>
        </div>
        
        <h2 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
          {errorInfo.title}
        </h2>
        
        <p className="mb-4 text-center text-gray-600 dark:text-gray-300">
          {errorInfo.message || '申し訳ありませんが、問題が発生しました。'}
        </p>
        
        <div className="mb-6 rounded-md bg-gray-50 dark:bg-gray-700/50 p-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">ヒント:</span> {errorInfo.help}
          </p>
        </div>
        
        <div className="flex flex-col space-y-3">
          <button 
            onClick={() => reset()}
            className="flex items-center justify-center bg-[#31A9B8] hover:bg-[#2a8f9c] text-white w-full px-4 py-2 rounded-md font-medium transition-colors"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            再試行する
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <Link href="/" className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors">
              <Home className="mr-2 h-4 w-4" />
              ホームに戻る
            </Link>
            
            <Link href="/projects" className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              プロジェクト一覧
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
