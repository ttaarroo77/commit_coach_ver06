import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// 特定の会話詳細取得エンドポイント
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;
    
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

    // 会話の基本情報を取得
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', session.user.id)
      .single();

    if (conversationError) {
      console.error('会話取得エラー:', conversationError);
      return NextResponse.json(
        { error: '会話の取得中にエラーが発生しました' },
        { status: 404 }
      );
    }

    // 会話に属するメッセージを取得
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('メッセージ取得エラー:', messagesError);
      return NextResponse.json(
        { error: 'メッセージの取得中にエラーが発生しました' },
        { status: 500 }
      );
    }

    // 会話情報とメッセージを組み合わせた結果を返却
    return NextResponse.json({
      ...conversation,
      messages: messages.map((msg: { id: string; content: string; role: string; created_at: string }) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        createdAt: msg.created_at
      }))
    });

  } catch (error) {
    console.error('APIエラー:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '不明なエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 会話の削除エンドポイント
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;
    
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

    // 会話が自分のものかを確認
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('user_id')
      .eq('id', conversationId)
      .single();

    if (conversationError || !conversation) {
      return NextResponse.json(
        { error: '会話が見つかりません' },
        { status: 404 }
      );
    }

    if (conversation.user_id !== session.user.id) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      );
    }

    // 会話を削除（外部キー制約によりメッセージも削除される）
    const { error: deleteError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (deleteError) {
      console.error('会話削除エラー:', deleteError);
      return NextResponse.json(
        { error: '会話の削除中にエラーが発生しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('APIエラー:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '不明なエラーが発生しました' },
      { status: 500 }
    );
  }
}
