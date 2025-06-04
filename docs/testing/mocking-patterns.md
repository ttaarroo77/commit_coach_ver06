# Commit Coachのモック実装パターン

## 概要

Commit Coachでは様々な外部依存関係や複雑なDOMインタラクションをテストするためにモック実装を活用しています。このドキュメントでは、プロジェクトで使用している主なモックパターンと実装例を解説します。

## 1. 外部ライブラリのモック

### 1.1 UI要素ライブラリ (lucide-react)

アイコンなどのビジュアル要素は単純なテスト用要素に置き換えます：

```typescript
// アイコンコンポーネントのモック例
jest.mock('lucide-react', () => ({
  Copy: () => <div data-testid="copy-icon">Copy</div>,
  Check: () => <div data-testid="check-icon">Check</div>,
  // 必要なアイコンを追加
}));
```

### 1.2 マークダウンレンダリング (react-markdown)

マークダウン変換ライブラリのモック：

```typescript
// react-markdownのモック
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="markdown-content">{children}</div>
  )
}));

// シンタックスハイライト関連
jest.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="syntax-highlighter">{children}</div>
  )
}));

jest.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  vscDarkPlus: {}
}));
```

### 1.3 Zustand状態管理

Zustandストアのモック実装：

```typescript
// Zustandストアのモック
import { create } from 'zustand';
import { type ChatStore } from '@/stores/chatStore';

// モックストア定義
const mockChatStore = create<ChatStore>()((set) => ({
  messages: [],
  isLoading: false,
  error: null,
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearMessages: () => set({ messages: [] }),
}));

// モック適用
jest.mock('@/stores/chatStore', () => ({
  useChatStore: () => mockChatStore((state) => state)
}));
```

## 2. Next.js関連のモック

### 2.1 Next.jsのルーティング

```typescript
// next/navigationのモック
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/current-path',
  useSearchParams: () => new URLSearchParams(),
}));
```

### 2.2 Next.jsのImage

```typescript
// next/imageのモック
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />;
  },
}));
```

### 2.3 App RouterのAPI

```typescript
// NextResponseとNextRequestをモック
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      json: jest.fn((data) => ({
        json: async () => data,
        status: 200,
        headers: new Map(),
      })),
    },
  };
});

// NextRequest代替実装
class MockNextRequest extends Request {
  constructor(input: RequestInfo, init?: RequestInit) {
    super(input, init);
  }
}

// テスト内で使用
const request = new MockNextRequest('http://localhost/api/endpoint', {
  method: 'POST',
  body: JSON.stringify({ key: 'value' }),
});
```

## 3. WebブラウザAPIのモック

### 3.1 DOM API

DOMメソッド（`scrollIntoView`など）のモック：

```typescript
// setupTests.jsファイルでグローバルに設定
beforeAll(() => {
  // scrollIntoViewのモック
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  
  // ResizeObserverのモック
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
});
```

### 3.2 Web Streams API

ReadableStreamのモック実装：

```typescript
// TextEncoderのモック
global.TextEncoder = jest.fn().mockImplementation(() => ({
  encode: jest.fn(() => new Uint8Array([1, 2, 3])),
}));

// ReadableStreamのモック
class MockReadableStream {
  constructor(source: any) {
    this.source = source;
  }
  getReader() {
    return {
      read: jest.fn().mockImplementation(() => {
        return Promise.resolve({ done: true, value: undefined });
      }),
      releaseLock: jest.fn(),
    };
  }
}

global.ReadableStream = MockReadableStream as any;
```

## 4. Supabaseクライアントのモック

### 4.1 認証関連

```typescript
// Supabase認証モック
const mockSupabaseAuth = {
  getUser: jest.fn().mockResolvedValue({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
      }
    },
    error: null,
  }),
  signOut: jest.fn().mockResolvedValue({ error: null }),
  // その他必要なメソッド
};

jest.mock('@/lib/supabase', () => ({
  createClient: () => ({
    auth: mockSupabaseAuth,
    // その他必要なクライアント機能
  }),
}));
```

### 4.2 データベース操作

```typescript
// Supabaseクエリモック
const mockSupabaseFromQuery = {
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({
    data: { /* モックデータ */ },
    error: null,
  }),
  then: jest.fn().mockImplementation((callback) => Promise.resolve(callback({
    data: { /* モックデータ */ },
    error: null,
  }))),
};

jest.mock('@/lib/supabase', () => ({
  createClient: () => ({
    from: jest.fn().mockReturnValue(mockSupabaseFromQuery),
    // その他必要なクライアント機能
  }),
}));
```

## 5. モックのベストプラクティス

1. **モジュールレベルのモック**：Jest の `jest.mock()` を使用して、ファイルの先頭でモジュール全体をモックする
2. **必要最小限のモック**：テスト対象の機能に必要な部分だけをモックし、過剰なモックは避ける
3. **setup ファイル活用**：共通のモックは `setupTests.js` などの設定ファイルで一元管理する
4. **型安全なモック**：TypeScript を使用する場合は、モック実装にも型を適用する
5. **副作用の注意**：グローバルなモックは他のテストに影響する可能性があるため、`afterEach` で必要に応じてリセットする

## 6. モックデータの管理

テスト用のモックデータは、以下のような場所に整理して配置することを推奨します：

```
__tests__/
  ├── __mocks__/       # Jest自動モック用ディレクトリ
  ├── fixtures/        # テスト用データセット
  │   ├── messages.ts  # チャットメッセージなどのモックデータ
  │   └── users.ts     # ユーザー情報などのモックデータ
  └── helpers/         # テスト用ヘルパー関数
      └── mockHelpers.ts  # モック生成用ヘルパー
```

モックデータ例：

```typescript
// __tests__/fixtures/messages.ts
export const mockMessages = [
  {
    id: '1',
    role: 'user',
    content: 'こんにちは、コミットメッセージを書くのを手伝ってください',
    timestamp: new Date('2025-01-01T10:00:00').toISOString(),
  },
  {
    id: '2',
    role: 'assistant',
    content: 'はい、喜んでお手伝いします！どのような変更を加えましたか？',
    timestamp: new Date('2025-01-01T10:00:10').toISOString(),
  },
];
```

## 7. モックのトラブルシューティング

モック関連の一般的な問題と解決策：

1. **モジュール解決の問題**：
   - 原因：Jest の moduleNameMapper が正しく設定されていない
   - 解決策：jest.config.js でパスエイリアスを適切に設定する

2. **ESM インポート互換性**：
   - 原因：一部のライブラリが ESM のみで提供されている
   - 解決策：transformIgnorePatterns の設定を調整する

3. **Reactフックの問題**：
   - 原因：React コンポーネント外での React フックの使用
   - 解決策：テスト用のラッパーコンポーネントを使用するか、`renderHook` を使用する

4. **非同期モックのタイミング問題**：
   - 原因：非同期処理の完了を待たずにアサーションを実行している
   - 解決策：`await` や `act()` を適切に使用する
