/**
 * エラーハンドリングユーティリティ
 * アプリケーション全体で一貫したエラー処理を提供します
 */

import { toast } from "sonner";

// エラータイプの定義
export type ErrorType = 
  | 'auth'       // 認証関連エラー
  | 'network'    // ネットワーク接続エラー 
  | 'api'        // API関連エラー
  | 'validation' // 入力検証エラー
  | 'unknown';   // 不明なエラー

// エラー詳細情報の型
export interface ErrorDetails {
  type: ErrorType;
  message: string;
  originalError?: unknown;
  actionLabel?: string;
  action?: () => void;
}

/**
 * エラーからエラータイプを判定する
 */
export function getErrorType(error: unknown): ErrorType {
  if (typeof error === 'object' && error !== null) {
    // ネットワークエラーの判定
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return 'network';
    }
    
    // 認証エラーの判定（Supabaseのエラーパターンに基づく）
    if ('error_description' in error && 
        typeof error.error_description === 'string' && 
        error.error_description.toLowerCase().includes('auth')) {
      return 'auth';
    }
    
    // APIエラーの判定
    if ('status' in error && typeof error.status === 'number') {
      return 'api';
    }

    // バリデーションエラー
    if ('type' in error && error.type === 'validation') {
      return 'validation';
    }
  }
  
  return 'unknown';
}

/**
 * ユーザーフレンドリーなエラーメッセージを生成
 */
export function getFriendlyErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    
    if ('error_description' in error && typeof error.error_description === 'string') {
      return error.error_description;
    }
  }
  
  return '予期せぬエラーが発生しました。もう一度お試しください。';
}

/**
 * エラー情報からヘルプテキストを生成
 */
export function getErrorHelp(type: ErrorType): string {
  switch (type) {
    case 'auth':
      return 'ログイン情報を確認するか、再度ログインしてください。';
    case 'network':
      return 'インターネット接続を確認してから、もう一度お試しください。';
    case 'api':
      return 'サーバーとの通信中に問題が発生しました。しばらく経ってからもう一度お試しください。';
    case 'validation':
      return '入力内容を確認して修正してください。';
    default:
      return '問題が解決しない場合は、更新してから再試行してください。';
  }
}

/**
 * エラー処理の統合関数
 * エラーをログに記録し、トースト通知を表示します
 */
export function handleError(
  error: unknown, 
  customMessage?: string,
  actionLabel?: string,
  action?: () => void
): ErrorDetails {
  // エラーをコンソールに出力
  console.error('Error occurred:', error);
  
  const errorType = getErrorType(error);
  const message = customMessage || getFriendlyErrorMessage(error);
  const help = getErrorHelp(errorType);
  
  // トースト通知の表示
  toast.error(message, {
    description: help,
    action: action && actionLabel ? {
      label: actionLabel,
      onClick: action
    } : undefined,
    // エラータイプに応じて表示時間を変更
    duration: errorType === 'network' ? 5000 : 3000
  });
  
  return {
    type: errorType,
    message,
    originalError: error,
    actionLabel,
    action
  };
}

/**
 * リソース読み込み時のエラーハンドラー（Suspense/Error Boundary用）
 */
export async function loadResourceSafely<T>(
  loadFn: () => Promise<T>,
  fallback: T,
  errorMessage = 'データの読み込みに失敗しました'
): Promise<T> {
  try {
    return await loadFn();
  } catch (error) {
    handleError(error, errorMessage);
    return fallback;
  }
}
