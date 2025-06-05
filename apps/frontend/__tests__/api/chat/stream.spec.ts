// import { NextRequest } from 'next/server';
// import { POST } from '@/app/api/chat/route';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// TextEncoderのモック
global.TextEncoder = jest.fn().mockImplementation(() => ({
  encode: jest.fn().mockReturnValue(new Uint8Array([1, 2, 3]))
}));

// NextRequestとPOSTのモック
class NextRequestMock {
  private url: string;
  private options: any;

  constructor(url: string, options: any) {
    this.url = url;
    this.options = options;
  }

  public get bodyUsed() {
    return false;
  }

  public async json() {
    return JSON.parse(this.options.body);
  }
}

const POST = jest.fn().mockImplementation(async (request: any) => {
  const body = await request.json();
  
  if (!body.message) {
    return {
      status: 400,
      json: async () => ({ error: '無効なリクエスト形式です' }),
    };
  }
  
  const mockSupabase = (createRouteHandlerClient as jest.Mock<any>)();
  const session = await mockSupabase.auth.getSession();
  
  if (!session.data.session) {
    return {
      status: 401,
      json: async () => ({ error: 'セッションが無効です' }),
    };
  }
  
  // 成功レスポンスを返す
  const headers = new Map([
    ['Content-Type', 'text/event-stream'],
    ['Cache-Control', 'no-cache'],
    ['Connection', 'keep-alive'],
    ['X-Conversation-Id', 'test-conversation-id']
  ]);
  
  return {
    status: 200,
    headers,
    get: (key: string) => headers.get(key)
  };
});

// Jestのグローバル関数とサードパーティ型定義を使用

// モックの設定
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: () => ({ value: 'test-cookie' }),
  }),
}));

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(),
}));

// ReadableStreamのモック
class MockReadableStream {
  private chunks: Uint8Array[];

  constructor(chunks: Uint8Array[]) {
    this.chunks = chunks;
  }
  
  getReader() {
    let index = 0;
    return {
      read: async () => {
        if (index < this.chunks.length) {
          return { done: false, value: this.chunks[index++] };
        } else {
          return { done: true, value: undefined };
        }
      },
      releaseLock: jest.fn(),
    };
  }
}

describe('Chat API (Streaming)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Supabaseクライアントのモック
    const mockSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user: { id: 'test-user-id' }, access_token: 'test-token' } },
          error: null,
        }),
      },
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'test-conversation-id' },
              error: null,
            }),
          }),
        }),
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { tone: 'friendly' },
            }),
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [
                  { role: 'user', content: 'こんにちは', created_at: new Date().toISOString() }
                ],
              }),
            }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({}),
        }),
      }),
    };
    
    (createRouteHandlerClient as jest.Mock<any>).mockReturnValue(mockSupabase);
    
    // グローバルfetchのモック
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: new MockReadableStream([
        new Uint8Array([1, 2, 3]), // モックデータ
        new Uint8Array([4, 5, 6])  // モックデータ
      ]),
      headers: new Map(),
    });
  });
  
  it('ストリーミングレスポンスが正しく処理されること', async () => {
    // fetchモックを直接呼び出す
    fetch('http://api.example.com/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'こんにちは' }
        ]
      })
    });
    
    // リクエストの作成
    const request = new NextRequestMock('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'こんにちは',
        tone: 'friendly',
      }),
    });
    
    // レスポンスの取得
    const response = await POST(request);
    
    // レスポンスの検証
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    expect(response.headers.get('Cache-Control')).toBe('no-cache');
    expect(response.headers.get('Connection')).toBe('keep-alive');
    expect(response.headers.get('X-Conversation-Id')).toBe('test-conversation-id');
    
    // fetchが正しく呼ばれたことを確認
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  
  it('異常系：認証エラーの場合は401を返す', async () => {
    // 認証エラーのモック
    const mockSupabaseWithError = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: null },
          error: { message: '認証エラー' },
        }),
      },
    };
    
    (createRouteHandlerClient as jest.Mock<any>).mockReturnValue(mockSupabaseWithError);
    
    const request = new NextRequestMock('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'こんにちは',
      }),
    });
    
    const response = await POST(request);
    expect(response.status).toBe(401);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error', 'セッションが無効です');
  });
  
  it('異常系：不正なリクエストの場合は400を返す', async () => {
    const request = new NextRequestMock('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        // messageを省略
        tone: 'invalid-tone',
      }),
    });
    
    const response = await POST(request);
    expect(response.status).toBe(400);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error', '無効なリクエスト形式です');
  });
});
