import { PrismaClient } from '@prisma/client';

// PrismaClientのインスタンスをグローバルに保持するための型定義
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// 開発環境では同じPrismaClientインスタンスを再利用する
// 本番環境では新しいインスタンスを作成
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// 開発環境でのみグローバル変数にインスタンスを保存
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
