import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// リクエストのバリデーションスキーマ
const chatRequestSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
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
    
    const { message, conversationId, projectId, tone } = result.data;

    // Cookieからセッション情報を取得
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // セッション情報の取得
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'セッションが無効です' },
        { status: 401 }
      );
    }

    // 会話IDが指定されていない場合、新しい会話を作成
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      try {
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            user_id: session.user.id,
            title: '新しい会話',
            project_id: projectId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('会話作成エラー:', createError);
          return NextResponse.json(
            { error: '会話の作成中にエラーが発生しました' },
            { status: 500 }
          );
        }

        currentConversationId = newConversation.id;
      } catch (error) {
        console.error('会話作成中にエラーが発生しました:', error);
        return NextResponse.json(
          { error: '会話の作成中にエラーが発生しました' },
          { status: 500 }
        );
      }
    }

    // ユーザーメッセージをDBに保存
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        user_id: session.user.id,
        conversation_id: currentConversationId,
        content: message,
        role: 'user',
        created_at: new Date().toISOString()
      });

    if (messageError) {
      console.error('メッセージ保存エラー:', messageError);
      // エラーがあっても処理は続行（会話IDは必要）
    }

    // ユーザーのトーン設定を取得
    const { data: profileData } = await supabase
      .from('profiles')
      .select('tone')
      .eq('id', session.user.id)
      .single();

    // ユーザー設定のトーンがあればそれを使用
    const userTone = profileData?.tone || tone;

    // 会話履歴の取得
    const { data: historyMessages } = await supabase
      .from('messages')
      .select('content, role, created_at')
      .eq('conversation_id', currentConversationId)
      .order('created_at', { ascending: true })
      .limit(20); // 直近20件のメッセージを取得

    // Supabase Edge Functionのエンドポイント
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const functionEndpoint = `${supabaseUrl}/functions/v1/chat`;

    // メッセージ履歴を Edge Function に渡すフォーマットに変換
    const formattedMessages = historyMessages?.map((msg: { role: string; content: string }) => ({
      role: msg.role,
      content: msg.content
    })) || [];

    // タイムアウト設定（30秒）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
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
          messages: formattedMessages,
          tone: userTone,
        }),
        signal: controller.signal,
      });

      // タイムアウトをクリア
      clearTimeout(timeoutId);

      // エラーチェック
      if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json(
          { error: errorData.error || 'チャットAPIでエラーが発生しました' },
          { status: response.status }
        );
      }

      // レスポンスヘッダーに会話IDを含める
      const headers = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Conversation-Id': currentConversationId as string, // 型アサーションでundefinedを排除
      };

      // ストリーミングレスポンスの設定
      const responseStream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          let assistantMessage = '';

          try {
            let continueReading = true;
            while (continueReading) {
              const { done, value } = await reader.read();
              if (done) {
                continueReading = false;
                break;
              }
              
              // レスポンステキストを追加
              const chunk = new TextDecoder().decode(value);
              assistantMessage += chunk;
              
              controller.enqueue(value);
            }

            // アシスタントの応答をDBに保存
            if (assistantMessage) {
              await supabase.from('messages').insert({
                user_id: session.user.id,
                conversation_id: currentConversationId,
                content: assistantMessage,
                role: 'assistant',
                created_at: new Date().toISOString()
              });

              // 会話の更新日時を更新
              await supabase
                .from('conversations')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', currentConversationId);
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
      return new NextResponse(responseStream, { headers });

    } catch (error: any) { // any型を使用
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
    console.error('APIエラー:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '不明なエラーが発生しました' },
      { status: 500 }
    );
  }
}
