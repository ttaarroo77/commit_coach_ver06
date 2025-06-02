/**
 * デモモード制御ユーティリティ
 * 
 * 環境変数とCookieを組み合わせてデモモードを制御します。
 * 本番環境では環境変数の値が優先され、デモモードは強制的にオフになります。
 */

import Cookies from 'js-cookie';

/**
 * 現在のデモモード状態を取得
 * @returns デモモードが有効かどうか
 */
export function isDemoModeEnabled(): boolean {
  // 環境変数が優先（本番環境ではfalseに固定）
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'false') {
    return false;
  }
  
  // 環境変数がtrueまたは未設定の場合はCookieの値を使用
  return Cookies.get('demo_mode') === 'true';
}

/**
 * サーバーサイドでデモモード状態を取得
 * @param cookieValue Cookie文字列
 * @returns デモモードが有効かどうか
 */
export function isDemoModeEnabledServer(cookieValue: string | undefined): boolean {
  // 環境変数が優先（本番環境ではfalseに固定）
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'false') {
    return false;
  }
  
  // 環境変数がtrueまたは未設定の場合はCookieの値を使用
  return cookieValue === 'true';
}
