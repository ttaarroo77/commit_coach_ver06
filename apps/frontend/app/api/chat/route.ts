import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { z } from 'zod';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// リクエストのバリデーションスキーマ
const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().min(1).max(4000),
    })
  ).min(1),
  tone: z.enum(['friendly', 'tough-love', 'humor', 'professional']).optional().default('friendly'),
});

export async function POST(req: NextRequest) {
  try {
    // リクエストボディの解析
    const body = await req.json();
    
    // Zodによるバリデーション
    const result = chatRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: '無効なリクエスト形式です', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { messages, tone } = result.data;

    // Cookieからセッション情報を取得
    const cookieStore = await cookies();
    const supabaseCookie = cookieStore.get('sb-auth-token')?.value;
    
    // Authorization ヘッダーからトークンを取得（フォールバック）
    const authHeader = req.headers.get('Authorization');
    const authToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    // CookieまたはAuthorizationヘッダーのどちらかが必要
    if (!supabaseCookie && !authToken) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // Supabaseクライアントの初期化
    const supabase = getSupabaseClient();
    
    // セッション情報の取得
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'セッションが無効です' },
        { status: 401 }
      );
    }

    // Supabase Edge Functionのエンドポイント
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const functionEndpoint = `${supabaseUrl}/functions/v1/chat`;

    // ユーザーのトーン設定を取得
    const { data: profileData } = await supabase
      .from('profiles')
      .select('tone')
      .eq('id', session.user.id)
      .single();

    // ユーザー設定のトーンがあればそれを使用
    const userTone = profileData?.tone || tone;

    // Supabase Edge Functionへのリクエスト
    const response = await fetch(functionEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        // テスト環境の場合はgpt-4oを使用するためのヘッダー
        ...(process.env.NODE_ENV === 'development' && { 'X-Client-Testing': 'true' }),
      },
      body: JSON.stringify({
        messages,
        tone: userTone,
      }),
    });

    // エラーチェック
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'チャットAPIでエラーが発生しました' },
        { status: response.status }
      );
    }

    // ストリーミングレスポンスの設定
    const responseStream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          let continueReading = true;
          while (continueReading) {
            const { done, value } = await reader.read();
            if (done) {
              continueReading = false;
              break;
            }
            controller.enqueue(value);
          }
        } catch (error) {
          console.error('ストリーミング中にエラーが発生しました:', error);
        } finally {
          controller.close();
          reader.releaseLock();
        }
      }
    });

    // ストリーミングレスポンスを返す
    return new NextResponse(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('APIエラー:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '不明なエラーが発生しました' },
      { status: 500 }
    );
  }
}
