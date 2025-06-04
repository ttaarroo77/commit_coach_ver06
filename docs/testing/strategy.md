# Commit Coach テスト戦略

## 概要

Commit Coachプロジェクトでは、品質保証とコード安定性を確保するために包括的なテスト戦略を採用しています。このドキュメントでは、プロジェクトで使用しているテスト手法、ツール、ベストプラクティスについて説明します。

## テストの階層

プロジェクトでは複数レベルのテストを実施しています：

### 1. 単体テスト (Unit Tests)

- **対象**: 個別の関数、コンポーネント、ユーティリティ
- **ツール**: Jest, React Testing Library
- **場所**: `__tests__/` ディレクトリ内の各コンポーネントやモジュールに対応するファイル
- **特徴**: 外部依存をモック化し、純粋な機能をテスト

### 2. 統合テスト (Integration Tests)

- **対象**: 複数のコンポーネントの連携、API連携
- **ツール**: Jest, React Testing Library, MSW (モックサーバー)
- **場所**: `__tests__/` ディレクトリ内の統合ファイル
- **特徴**: 実際のユーザーフローを模倣し、コンポーネント間の相互作用をテスト

### 3. E2Eテスト (今後の課題)

- **対象**: エンドツーエンドのユーザーフロー
- **ツール**: Playwright または Cypress
- **特徴**: 実際のブラウザーでの動作を検証

## テスト環境

### フロントエンド

- **Jest**: テストランナーとして使用
- **React Testing Library**: コンポーネントのレンダリングとインタラクションテスト
- **jest-environment-jsdom**: DOMシミュレーション環境
- **@testing-library/jest-dom**: DOM要素のカスタムマッチャー

### バックエンド

- **Jest**: テストランナーとして使用
- **Supabaseモック**: データベース操作のモック

## テストカバレッジ目標

- **コア機能**: 90%以上のカバレッジ
- **ユーティリティ**: 80%以上のカバレッジ
- **UI要素**: 主要フローと重要なエッジケースをカバー

カバレッジレポートは `pnpm test -- --coverage` で生成できます。

## テスト実装パターン

### コンポーネントテスト

React Testing Library (RTL) を使用したコンポーネントテストのパターン：

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Component from '@/components/path/to/component';

describe('コンポーネント名', () => {
  it('期待される動作の説明', () => {
    // コンポーネントのレンダリング
    render(<Component prop1={value1} prop2={value2} />);
    
    // 要素の存在確認
    expect(screen.getByText('表示されるテキスト')).toBeInTheDocument();
    
    // ユーザー操作のシミュレーション
    await userEvent.click(screen.getByRole('button', { name: 'ボタン名' }));
    
    // 操作後の状態確認
    expect(screen.getByText('更新後のテキスト')).toBeInTheDocument();
  });
});
```

### フック (Hooks) テスト

カスタムフックをテストするためのパターン：

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import useCustomHook from '@/hooks/useCustomHook';

describe('useCustomHook', () => {
  it('初期状態と更新動作の確認', () => {
    // フックのレンダリング
    const { result } = renderHook(() => useCustomHook(initialProps));
    
    // 初期状態の確認
    expect(result.current.value).toBe(expectedInitialValue);
    
    // 状態更新のシミュレーション
    act(() => {
      result.current.updateFunction(newValue);
    });
    
    // 更新後の状態確認
    expect(result.current.value).toBe(expectedUpdatedValue);
  });
});
```

### APIテスト

APIエンドポイントのテストパターン：

```typescript
import handler from '@/app/api/endpoint/route';

describe('API: /api/endpoint', () => {
  it('正常系リクエストの動作確認', async () => {
    // モックリクエストの作成
    const request = new Request('http://localhost/api/endpoint', {
      method: 'POST',
      body: JSON.stringify({ key: 'value' }),
    });
    
    // レスポンスの取得
    const response = await handler.POST(request);
    const data = await response.json();
    
    // レスポンスの検証
    expect(response.status).toBe(200);
    expect(data).toEqual(expectedResponseData);
  });
});
```

## モック戦略

詳細なモック戦略は [mocking-patterns.md](./mocking-patterns.md) を参照してください。

## テスト実行

### 開発中のテスト実行

```bash
# 全テストの実行
pnpm test

# 特定のファイルのテスト実行
pnpm test -- path/to/test/file

# 特定のテスト名にマッチするテストの実行
pnpm test -- -t "テスト名の一部"

# ウォッチモードでの実行（ファイル変更時に自動実行）
pnpm test -- --watch
```

### CIでのテスト実行

GitHub Actionsワークフローで以下のコマンドを実行：

```bash
pnpm lint && pnpm type-check && pnpm test && pnpm build
```

## ベストプラクティス

1. **テストは独立していること**: 各テストは他のテストに依存せず、独立して実行できること
2. **実装詳細ではなく動作をテスト**: 内部実装より、ユーザーの視点からの動作をテスト
3. **適切なアサーション**: 必要最小限の検証で十分な確認を行う
4. **テストデータの明確化**: モックデータは明示的に定義し、テストの意図を明確に
5. **テストファイルの整理**: テスト対象のファイル構造に合わせてテストを整理

## テスト改善の継続的な取り組み

- 定期的なカバレッジレビュー
- テスト実行時間の最適化
- モックデータ管理の改善
- テストパターンの標準化
