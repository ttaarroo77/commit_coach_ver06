"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { getErrorType, getFriendlyErrorMessage, getErrorHelp } from "@/lib/error-utils";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: {
    type: string;
    title: string;
    message: string;
    help: string;
  };
}

/**
 * エラーバウンダリーコンポーネント
 * Reactコンポーネントツリー内でエラーをキャッチし、フォールバックUIを表示します
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: {
        type: "unknown",
        title: "予期せぬエラーが発生しました",
        message: "",
        help: "",
      },
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { 
      hasError: true,
      error 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // エラーをログに記録
    console.error("コンポーネントエラー:", error, errorInfo);
    
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
    
    this.setState({
      errorInfo: {
        type: errorType as string,
        title,
        message,
        help,
      }
    });
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // デフォルトのエラー表示
      return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
          <div className="mb-4 flex items-center">
            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-2 mr-3">
              <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {this.state.errorInfo.title}
            </h3>
          </div>
          
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
            {this.state.errorInfo.message || 'コンポーネントのレンダリング中にエラーが発生しました。'}
          </p>
          
          <div className="mb-4 rounded-md bg-gray-50 dark:bg-gray-700/50 p-3">
            <p className="text-xs text-gray-700 dark:text-gray-300">
              <span className="font-semibold">ヒント:</span> {this.state.errorInfo.help}
            </p>
          </div>
          
          <button 
            onClick={this.resetError}
            className="flex items-center text-sm bg-[#31A9B8] hover:bg-[#2a8f9c] text-white px-3 py-1.5 rounded-md font-medium transition-colors"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            再試行する
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
