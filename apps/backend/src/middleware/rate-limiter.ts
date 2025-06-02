import { Request, Response, NextFunction } from 'express';

// シンプルなメモリベースのレート制限実装
// 実環境では Redis などを使った分散型実装が推奨されます
const requestTimestamps: Record<string, number[]> = {};

/**
 * レート制限ミドルウェア
 * デフォルトでは 1 リクエスト/秒 の制限を適用
 */
export const rateLimiter = (requestsPerSecond = 1) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const currentTime = Date.now();
    
    // クライアントのタイムスタンプ記録を初期化
    if (!requestTimestamps[clientIp]) {
      requestTimestamps[clientIp] = [];
    }
    
    // 1秒より古いタイムスタンプを削除
    requestTimestamps[clientIp] = requestTimestamps[clientIp].filter(
      timestamp => currentTime - timestamp < 1000
    );
    
    // 現在のリクエスト数を確認
    if (requestTimestamps[clientIp].length >= requestsPerSecond) {
      return res.status(429).json({
        error: 'レート制限を超えました。しばらく待ってから再試行してください。',
        retryAfter: '1秒後に再試行してください'
      });
    }
    
    // 現在のタイムスタンプを追加
    requestTimestamps[clientIp].push(currentTime);
    
    next();
  };
};
