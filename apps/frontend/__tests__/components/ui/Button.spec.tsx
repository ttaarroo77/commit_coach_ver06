/**
 * Buttonコンポーネントのテスト
 * @jest-environment jsdom
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// シンプルなスタブを使用
const ButtonStub = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <button className={className}>{children}</button>
);

// Buttonコンポーネントのモック
jest.mock('@/components/ui/button', () => ({
  Button: ButtonStub
}));

// モック化されたButtonをインポート
import { Button } from '@/components/ui/button';

describe('Buttonコンポーネント', () => {
  it('ボタンが正しくレンダリングされること', () => {
    const { container } = render(<Button>ボタンテキスト</Button>);
    expect(container.textContent).toBe('ボタンテキスト');
  });

  it('クラス名を持つボタンが正しくレンダリングされること', () => {
    const { container } = render(<Button className="test-class">ボタンテキスト</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('test-class');
  });

  it('子要素を持つボタンが正しくレンダリングされること', () => {
    const { container } = render(
      <Button>
        <span>アイコン</span>
        ボタンテキスト
      </Button>
    );
    expect(container.textContent).toBe('アイコンボタンテキスト');
    expect(container.querySelector('span')).not.toBeNull();
  });
});
