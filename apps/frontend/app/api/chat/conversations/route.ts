import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// 会話リスト取得エンドポイント
export async function GET(req: NextRequest) {
  try {
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

    // クエリパラメータから取得件数を設定（デフォルト10件）
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    // 会話リストを取得
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        title,
        project_id,
        created_at,
        updated_at
      `)
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('会話リスト取得エラー:', error);
      return NextResponse.json(
        { error: '会話リストの取得中にエラーが発生しました' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('APIエラー:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '不明なエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 会話作成エンドポイント
export async function POST(req: NextRequest) {
  try {
    // リクエストボディの解析
    const body = await req.json();
    const { title = '新しい会話', projectId } = body;

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

    // 新しい会話を作成
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: session.user.id,
        title,
        project_id: projectId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('会話作成エラー:', error);
      return NextResponse.json(
        { error: '会話の作成中にエラーが発生しました' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('APIエラー:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '不明なエラーが発生しました' },
      { status: 500 }
    );
  }
}
