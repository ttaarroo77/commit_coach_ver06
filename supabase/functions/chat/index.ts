import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { OpenAI } from 'https://esm.sh/openai@4.20.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-client-testing',
};

// レート制限の設定
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1分
  maxRequests: 10, // 1分あたりの最大リクエスト数
};

// レート制限の状態を保持
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// レート制限チェック関数
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT.maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

// エラーメッセージの定義
const ErrorMessages = {
  RATE_LIMIT_EXCEEDED: 'リクエスト制限を超えました。しばらく待ってから再試行してください。',
  INVALID_REQUEST: '無効なリクエストです。',
  UNAUTHORIZED: '認証が必要です。',
  INTERNAL_ERROR: 'サーバーエラーが発生しました。',
  OPENAI_ERROR: 'AIの応答生成中にエラーが発生しました。',
} as const;

// エラーレスポンス生成関数
function createErrorResponse(message: string, status: number) {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

// メッセージ履歴の取得
async function getMessageHistory(supabase: any, userId: string, limit: number = 10) {
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching message history:', error);
    return [];
  }

  return messages.reverse();
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
      return createErrorResponse('OpenAI API key is not configured', 500);
    }

    // ヘッダーからJWTトークンを取得
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return createErrorResponse(ErrorMessages.UNAUTHORIZED, 401);
    }

    // Supabaseクライアントの初期化
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ユーザー認証
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return createErrorResponse(ErrorMessages.UNAUTHORIZED, 401);
    }

    // レート制限チェック
    if (!checkRateLimit(user.id)) {
      return createErrorResponse(ErrorMessages.RATE_LIMIT_EXCEEDED, 429);
    }

    // メッセージ履歴の取得
    const messageHistory = await getMessageHistory(supabase, user.id);
    const formattedHistory = messageHistory.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.created_at
    }));

    // トーンに基づいたシステムプロンプトの設定
    let systemPrompt = '';
    switch (tone) {
      case 'friendly':
        systemPrompt = `あなたはフレンドリーで親切なコミットコーチです。
以下の特徴を持っています：
- 常に励ましの言葉を交えながら、具体的で実用的なアドバイスを提供
- ユーザーの成功を心から喜び、失敗を優しく受け止める
- 技術的な説明は分かりやすく、例を交えて説明
- ユーザーの成長を第一に考え、段階的な学習をサポート
- エラーや問題に対して、解決のための具体的なステップを提供

プログラミングや開発プロセスについて、以下の観点からサポートします：
- コードの品質と可読性
- ベストプラクティスの適用
- デバッグと問題解決
- アーキテクチャの設計
- パフォーマンスの最適化`;
        break;
      case 'tough-love':
        systemPrompt = `あなたは厳格だが公平なコミットコーチです。
以下の特徴を持っています：
- 高品質なコードと開発プラクティスを厳格に要求
- 直接的なフィードバックを提供し、改善点を明確に指摘
- 甘えを許さず、プロフェッショナルな姿勢を要求
- 技術的な厳密さを重視し、妥協を許さない
- ユーザーの成長のために、時に厳しい言葉も使用

プログラミングや開発プロセスについて、以下の観点から厳格にサポートします：
- コードの品質と保守性
- セキュリティと堅牢性
- パフォーマンスと最適化
- アーキテクチャの設計と実装
- テストと品質保証`;
        break;
      case 'humor':
        systemPrompt = `あなたはユーモアのセンスがあるコミットコーチです。
以下の特徴を持っています：
- プログラミングの世界の面白い例えやジョークを交えた説明
- 技術的な概念を楽しく、分かりやすく解説
- エラーや問題をユーモアを交えて解決
- 開発の楽しさを伝えながら、実用的なアドバイスを提供
- リラックスした雰囲気で学習をサポート

プログラミングや開発プロセスについて、以下の観点から楽しくサポートします：
- コードの品質と可読性
- デバッグと問題解決
- ベストプラクティスの適用
- アーキテクチャの設計
- パフォーマンスの最適化`;
        break;
      case 'professional':
        systemPrompt = `あなたはプロフェッショナルなコミットコーチです。
以下の特徴を持っています：
- ビジネスと技術の両面から、実践的なアドバイスを提供
- 業界標準とベストプラクティスに基づいた指導
- 効率的な開発プロセスとチームワークの促進
- 品質と生産性のバランスを重視
- 長期的な視点での技術選定と設計

プログラミングや開発プロセスについて、以下の観点からサポートします：
- アーキテクチャと設計パターン
- コードの品質と保守性
- パフォーマンスとスケーラビリティ
- セキュリティと堅牢性
- チーム開発とコラボレーション`;
        break;
      default:
        systemPrompt = `あなたはコミットコーチです。
以下の特徴を持っています：
- ユーザーのプログラミングや開発プロセスをサポート
- 具体的で実用的なアドバイスを提供
- 技術的な課題の解決をサポート
- ベストプラクティスの適用を促進
- ユーザーの成長をサポート`;
    }

    // システムプロンプトをメッセージの先頭に追加
    const allMessages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...formattedHistory,
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
            role: 'user',
            created_at: new Date().toISOString()
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
            role: 'assistant',
            created_at: new Date().toISOString()
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
    return createErrorResponse(
      error.message === 'Unexpected end of JSON input'
        ? ErrorMessages.INVALID_REQUEST
        : ErrorMessages.INTERNAL_ERROR,
      error.message === 'Unexpected end of JSON input' ? 400 : 500
    );
  }
});
