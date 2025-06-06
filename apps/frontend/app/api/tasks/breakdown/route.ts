import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// タスク分解リクエストのバリデーションスキーマ
const taskBreakdownRequestSchema = z.object({
  level: z.enum(['project', 'task']),
  title: z.string().min(1).max(1000),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // リクエストボディの解析
    const body = await req.json();
    
    // Zodによるバリデーション
    const result = taskBreakdownRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: '無効なリクエスト形式です', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { level, title, description = '' } = result.data;

    // Cookieからセッション情報を取得
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // セッション情報の取得
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // デモモードの場合は認証をスキップ
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    console.log(`環境設定: 開発環境=${isDevelopment}, デモモード=${isDemoMode}`);
    
    // 開発環境またはデモモードの場合は認証をスキップ
    if ((sessionError || !session) && !isDevelopment && !isDemoMode) {
      return NextResponse.json(
        { error: 'セッションが無効です' },
        { status: 401 }
      );
    }

    // デモモードの場合はダミーデータを返す
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      // タイミングを擬似的に再現するため少し待つ
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (level === 'project') {
        return NextResponse.json({
          subtasks: [
            { title: "要件定義と分析", completed: false },
            { title: "設計と計画の作成", completed: false },
            { title: "実装とコーディング", completed: false },
            { title: "テストと品質保証", completed: false },
            { title: "デプロイと運用準備", completed: false }
          ]
        });
      } else {
        return NextResponse.json({
          subtasks: [
            { title: `${title}の下準備`, completed: false },
            { title: `${title}の主要機能実装`, completed: false },
            { title: `${title}のテスト`, completed: false }
          ]
        });
      }
    }

    // プロンプトの準備
    const promptTemplate = level === 'project' 
      ? `以下はプロジェクトのタイトルです： "${title}"
${description ? `\n追加情報: ${description}` : ''}

このプロジェクトを5〜7個のタスクに分解してください。
各タスクは具体的で、1-2週間程度で完了できる単位にしてください。
タスク名は50文字以内の簡潔な日本語にしてください。`
      : `以下はタスクのタイトルです： "${title}"
${description ? `\n追加情報: ${description}` : ''}

このタスクを3〜5個のサブタスクに分解してください。
各サブタスクは具体的で、1-3日程度で完了できる単位にしてください。
サブタスク名は50文字以内の簡潔な日本語にしてください。`;

    // Supabase Edge Functionのエンドポイント
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const functionEndpoint = `${supabaseUrl}/functions/v1/task_breakdown`;

    // タイムアウト設定（20秒）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      // デモモードの場合のみダミーレスポンスを返す
      if (isDemoMode) {
        console.log('デモモード: ダミータスク分解を使用');
        // タイミングを擬似的に再現するため少し待つ
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (level === 'project') {
          return NextResponse.json({
            subtasks: [
              { title: "要件定義と分析", completed: false },
              { title: "設計と計画の作成", completed: false },
              { title: "実装とコーディング", completed: false },
              { title: "テストと品質保証", completed: false },
              { title: "デプロイと運用準備", completed: false }
            ]
          });
        } else {
          return NextResponse.json({
            subtasks: [
              { title: `${title}の下準備`, completed: false },
              { title: `${title}の主要機能実装`, completed: false },
              { title: `${title}のテスト`, completed: false }
            ]
          });
        }
      }
      
      console.log('Edge Function呼び出し: 実タスク分解を使用');
      // Supabase Edge Functionへのリクエスト
      const authHeader = session ? `Bearer ${session.access_token}` : 'Bearer dummy-token-for-development';
      const response = await fetch(functionEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
          // テスト環境の場合はGPT-4oを使用するヘッダー
          ...(process.env.NODE_ENV === 'development' && { 'X-Client-Testing': 'true' }),
        },
        body: JSON.stringify({
          prompt: promptTemplate
        }),
        signal: controller.signal,
      });

      // タイムアウトをクリア
      clearTimeout(timeoutId);

      // レスポンスの処理
      if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json(
          { error: errorData.error || 'タスク分解APIでエラーが発生しました' },
          { status: response.status }
        );
      }

      // 正常なレスポンスを返す
      const data = await response.json();
      return NextResponse.json(data);

    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // AbortErrorの場合はタイムアウトエラーを返す
      if (error && error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'AIが混雑しています。しばらく待ってから再試行してください。', timeout: true },
          { status: 408 }
        );
      }
      
      throw error; // その他のエラーは下のcatchブロックで処理
    }

  } catch (error) {
    console.error('タスク分解APIエラー:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '不明なエラーが発生しました' },
      { status: 500 }
    );
  }
}
