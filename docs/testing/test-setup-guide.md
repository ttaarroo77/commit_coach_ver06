# テスト環境セットアップガイド

## 概要

Commit Coachのテスト環境を正しくセットアップし、効率的にテストを実行するための手順を説明します。React 19およびReact Testing Library（RTL）を使用した最新の構成に基づいています。

## 前提条件

- Node.js 20.x 以上
- pnpm 8.9.0 以上
- プロジェクトがクローンまたはダウンロードされていること

## 基本セットアップ

1. **依存関係のインストール**

```bash
# プロジェクトルートディレクトリで実行
pnpm install
```

2. **テスト実行の基本コマンド**

```bash
# フロントエンドテストの実行
cd apps/frontend
pnpm test

# バックエンドテストの実行（現在は未実装）
cd apps/backend
pnpm test
```

## Jest設定ファイル

フロントエンドのJest設定は `apps/frontend/jest.config.js` にあります。主要な設定項目：

```javascript
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
};
```

## テスト環境ファイル

`jest.setup.js` ファイルには、すべてのテストで必要な共通設定やモックが含まれています：

```javascript
// apps/frontend/jest.setup.js
import '@testing-library/jest-dom';

// グローバルモックの設定
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
```

## React Testing Library の使用方法

### 1. コンポーネントのレンダリングとテスト

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '@/components/ui/Button';

describe('Button コンポーネント', () => {
  it('クリックするとonClickハンドラーが呼ばれる', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>テスト</Button>);
    
    await userEvent.click(screen.getByRole('button', { name: 'テスト' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2. カスタムクエリの使用

テキスト、ロール、テストIDなどでDOM要素を検索できます：

```typescript
// テキストで検索
screen.getByText('表示テキスト');

// roleで検索（アクセシビリティ属性に基づく）
screen.getByRole('button', { name: 'ボタン名' });

// テストIDで検索（推奨）
screen.getByTestId('unique-test-id');

// ラベルテキストで検索
screen.getByLabelText('ラベル名');

// プレースホルダーで検索
screen.getByPlaceholderText('プレースホルダーテキスト');
```

### 3. 非同期処理のテスト

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AsyncComponent from '@/components/AsyncComponent';

test('非同期データ読み込みのテスト', async () => {
  render(<AsyncComponent />);
  
  // ローディング状態の確認
  expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  
  // データ読み込み完了を待機
  await waitFor(() => {
    expect(screen.getByText('データ:')).toBeInTheDocument();
  });
  
  // ボタンクリック後の状態変化を待機
  const button = screen.getByRole('button');
  await userEvent.click(button);
  
  await waitFor(() => {
    expect(screen.getByText('更新済み')).toBeInTheDocument();
  });
});
```

### 4. React Hooks のテスト

React Hooks をテストするには、`@testing-library/react-hooks` を使用します：

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import useCounter from '@/hooks/useCounter';

test('カウンター機能のテスト', () => {
  const { result } = renderHook(() => useCounter());
  
  // 初期値の確認
  expect(result.current.count).toBe(0);
  
  // インクリメント操作
  act(() => {
    result.current.increment();
  });
  
  // 更新後の値を確認
  expect(result.current.count).toBe(1);
});
```

## コンテキストや状態管理のテスト

### Zustandストア

Zustandストアをテストする例：

```typescript
import { create } from 'zustand';
import { act } from '@testing-library/react';
import { chatStoreCreator, ChatStore } from '@/stores/chatStore';

describe('ChatStore', () => {
  let useTestStore: ReturnType<typeof create<ChatStore>>;

  beforeEach(() => {
    useTestStore = create(chatStoreCreator);
  });

  it('メッセージを追加できる', () => {
    const message = { role: 'user', content: 'テストメッセージ' };
    
    act(() => {
      useTestStore.getState().addMessage(message);
    });
    
    expect(useTestStore.getState().messages).toContainEqual(message);
  });
});
```

### Reactコンテキスト

コンテキストを使用するコンポーネントをテストするためのラッパー：

```typescript
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/context/ThemeContext';
import ThemedComponent from '@/components/ThemedComponent';

test('テーマコンテキストを使用するコンポーネントのテスト', () => {
  render(
    <ThemeProvider initialTheme="dark">
      <ThemedComponent />
    </ThemeProvider>
  );
  
  expect(screen.getByText('ダークモード')).toBeInTheDocument();
});
```

## モックの作成と管理

詳細なモックパターンについては [mocking-patterns.md](./mocking-patterns.md) を参照してください。

### テスト用データの準備

```typescript
// __tests__/fixtures/testData.ts
export const mockUsers = [
  { id: '1', name: '山田太郎', email: 'yamada@example.com' },
  { id: '2', name: '鈴木花子', email: 'suzuki@example.com' },
];

// テスト内で使用
import { mockUsers } from '../fixtures/testData';

test('ユーザー一覧の表示', () => {
  render(<UserList users={mockUsers} />);
  expect(screen.getByText('山田太郎')).toBeInTheDocument();
});
```

## スナップショットテストからRTLへの移行

Commit Coachでは、スナップショットテストから具体的なDOMテストへの移行を推進しています：

### 移行手順

1. スナップショットテストを特定：
```typescript
// 古いスナップショットテスト
it('コンポーネントが正しくレンダリングされる', () => {
  const tree = renderer.create(<Component />).toJSON();
  expect(tree).toMatchSnapshot();
});
```

2. RTLパターンに変換：
```typescript
// 新しいRTLテスト
it('コンポーネントが正しくレンダリングされる', () => {
  render(<Component />);
  expect(screen.getByRole('heading')).toBeInTheDocument();
  expect(screen.getByText('期待されるテキスト')).toBeInTheDocument();
});
```

3. 古いスナップショットファイルの削除：
```bash
pnpm test -- -u
```

## テストカバレッジの生成

カバレッジレポートを生成するには：

```bash
cd apps/frontend
pnpm test -- --coverage
```

レポートは `apps/frontend/coverage` ディレクトリに生成されます。

## トラブルシューティング

### よくある問題と解決策

1. **テストがタイムアウトする**
   - テスト内の非同期処理が正しく完了していない可能性があります
   - `waitFor`, `findBy*` メソッドの使用を検討してください

2. **Reactフックのエラー**
   - Reactフックはコンポーネント内でのみ使用できます
   - テスト内でフックを使用する場合は `renderHook` を使用してください

3. **CSSモジュールのエラー**
   - `moduleNameMapper` が正しく設定されているか確認してください
   - スタイルファイルのモックが適切に設定されているか確認してください

4. **JSXの変換エラー**
   - Babel設定が最新のReactのJSX変換に対応しているか確認してください
   - `babel.config.js` の `@babel/preset-react` の設定を `{ runtime: 'automatic' }` に更新してください

5. **DOM要素が見つからない**
   - 要素が実際に存在するか確認してください
   - 様々なクエリメソッド (`getByText`, `getByRole` など) を試してください
   - `screen.debug()` を使用して現在のDOM状態をコンソールに出力できます

## 参考リソース

- [Jest 公式ドキュメント](https://jestjs.io/ja/docs/getting-started)
- [React Testing Library 公式ドキュメント](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries チートシート](https://testing-library.com/docs/queries/about/)
- [Jestマッチャーのリファレンス](https://jestjs.io/ja/docs/expect)

## 最新の更新

このガイドは2025年6月に更新され、React 19およびReact Testing Libraryの最新のベストプラクティスを反映しています。新しいテスト技術や手法が導入された場合は、このドキュメントも適宜更新されます。
