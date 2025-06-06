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
  maxRequests: 5, // 1分あたりの最大リクエスト数
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

serve(async (req) => {
  // CORSプリフライトリクエスト対応
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // リクエストボディの解析
    const { prompt } = await req.json();

    if (!prompt) {
      return createErrorResponse('プロンプトが指定されていません', 400);
    }

    // 環境変数の取得
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';

    // APIキーチェック
    if (!openaiApiKey) {
      return createErrorResponse('OpenAI API key is not configured', 500);
    }

    // 開発環境判定用のヘッダーを取得
    const isDevMode = req.headers.get('X-Environment') === 'development';
    const isDemoMode = req.headers.get('X-Demo-Mode') === 'true';
    console.log(`環境設定: 開発環境=${isDevMode}, デモモード=${isDemoMode}`);
    
    // Supabaseクライアントの初期化
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    let user = null;
    
    // 開発環境やデモモードでない場合のみ認証を行う
    if (!isDevMode && !isDemoMode) {
      // ヘッダーからJWTトークンを取得
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return createErrorResponse(ErrorMessages.UNAUTHORIZED, 401);
      }

      // ユーザー認証
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !authUser) {
        return createErrorResponse(ErrorMessages.UNAUTHORIZED, 401);
      }
      
      user = authUser;
    } else {
      console.log('開発環境またはデモモードのため認証をスキップ');
      // 開発環境やデモモードの場合はダミーユーザーIDを設定
      user = { id: 'dev-user-' + Date.now() };
    }

    // レート制限チェック
    if (!checkRateLimit(user.id)) {
      return createErrorResponse(ErrorMessages.RATE_LIMIT_EXCEEDED, 429);
    }

    // OpenAIクライアントの初期化
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    // テスト環境かどうかを確認（gpt-4oを使用するかの判断）
    const isTestEnv = req.headers.get('X-Client-Testing') === 'true';
    const model = isTestEnv ? 'gpt-4o' : 'gpt-3.5-turbo';

    try {
      // OpenAI APIを呼び出してタスク分解を行う
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `あなたはタスク分解の専門家です。
与えられたプロジェクトやタスクを適切なサブタスクに分解してください。
分解結果は以下のJSONフォーマットで出力してください：

{
  "subtasks": [
    {"title": "サブタスク1のタイトル", "completed": false},
    {"title": "サブタスク2のタイトル", "completed": false},
    ...
  ]
}

分解するサブタスクの数は、プロジェクトレベルの場合は5〜7個、タスクレベルの場合は3〜5個が適切です。
サブタスク名は50文字以内の簡潔な日本語にしてください。`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      // レスポンスの整形
      const response = completion.choices[0].message.content;
      // JSONをパースして返す
      const parsedResponse = JSON.parse(response || '{}');
      
      // 正しい形式のJSONを返す
      return new Response(
        JSON.stringify(parsedResponse),
        { 
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );

    } catch (apiError) {
      console.error('OpenAI API Error:', apiError);
      return createErrorResponse(ErrorMessages.OPENAI_ERROR, 500);
    }

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
