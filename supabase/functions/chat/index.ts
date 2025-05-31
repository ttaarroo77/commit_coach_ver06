import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { OpenAI } from 'https://esm.sh/openai@4.20.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-client-testing',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

serve(async (req) => {
  // CORSプリフライトリクエスト対応
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // リクエストボディの解析
    const { messages, tone = 'friendly' } = await req.json();

    // 環境変数の取得
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';

    // APIキーチェック
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ヘッダーからJWTトークンを取得
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header is required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Supabaseクライアントの初期化
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ユーザー認証
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // トーンに基づいたシステムプロンプトの設定
    let systemPrompt = '';
    switch (tone) {
      case 'friendly':
        systemPrompt = 'あなたはフレンドリーで親切なコミットコーチです。ユーザーのプログラミングや開発プロセスをサポートします。励ましの言葉を交えながら、具体的で実用的なアドバイスを提供してください。';
        break;
      case 'tough-love':
        systemPrompt = 'あなたは厳格だが公平なコミットコーチです。ユーザーの甘えを許さず、高品質なコードと開発プラクティスを要求します。直接的なフィードバックを提供し、改善点を明確に指摘してください。';
        break;
      case 'humor':
        systemPrompt = 'あなたはユーモアのセンスがあるコミットコーチです。冗談やウィットに富んだ表現を交えながら、プログラミングや開発のアドバイスを提供してください。楽しく学べる雰囲気を作りつつ、実用的な情報も伝えてください。';
        break;
      default:
        systemPrompt = 'あなたはコミットコーチです。ユーザーのプログラミングや開発プロセスをサポートします。';
    }

    // システムプロンプトをメッセージの先頭に追加
    const allMessages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // OpenAIクライアントの初期化
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    // テスト環境かどうかを確認（gpt-4oを使用するかの判断）
    const isTestEnv = req.headers.get('X-Client-Testing') === 'true';
    const model = isTestEnv ? 'gpt-4o' : 'gpt-3.5-turbo';

    // OpenAI APIを呼び出してレスポンスを取得
    const completion = await openai.chat.completions.create({
      model,
      messages: allMessages,
      temperature: 0.7,
      stream: true,
    });

    // ストリーミングレスポンスの設定
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // メッセージをDBに保存（ユーザーメッセージのみ）
        const lastUserMessage = messages.findLast((msg: Message) => msg.role === 'user');
        if (lastUserMessage) {
          await supabase.from('messages').insert({
            user_id: user.id,
            content: lastUserMessage.content,
            role: 'user'
          });
        }

        let assistantMessage = '';

        // ストリーミングレスポンスの処理
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            assistantMessage += content;
            controller.enqueue(encoder.encode(content));
          }
        }

        // アシスタントの応答をDBに保存
        if (assistantMessage) {
          await supabase.from('messages').insert({
            user_id: user.id,
            content: assistantMessage,
            role: 'assistant'
          });
        }

        controller.close();
      }
    });

    // ストリーミングレスポンスを返す
    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
