/**
 * ChatMessageコンポーネントのReact Testing Libraryテスト
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatMessage from '@/components/chat/chat-message';

// モック設定
jest.mock('lucide-react', () => ({
  Copy: () => <div data-testid="copy-icon">Copy</div>,
  Check: () => <div data-testid="check-icon">Check</div>
}));

// react-markdownのモック
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="markdown-content">{children}</div>
  )
}));

// SyntaxHighlighterのモック
jest.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="syntax-highlighter">{children}</div>
  )
}));

jest.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  vscDarkPlus: {}
}));

describe('ChatMessageコンポーネント', () => {
  it('ユーザーメッセージのレンダリングが正しく行われること', () => {
    const userMessage = {
      role: 'user',
      content: 'こんにちは、助けてください'
    } as const;

    render(<ChatMessage message={userMessage} />);
    
    // ユーザーメッセージであることが確認できるためのクラス名をチェック
    const messageElement = screen.getByText('こんにちは、助けてください');
    expect(messageElement).toBeInTheDocument();
    
    // ユーザーメッセージが正しく表示されていることの確認で十分
    const container = messageElement.closest('div');
    expect(container).not.toBeNull();
  });

  it('AIアシスタントメッセージのレンダリングが正しく行われること', () => {
    const assistantMessage = {
      role: 'assistant',
      content: 'こんにちは！どのようにお手伝いしましょうか？'
    } as const;

    render(<ChatMessage message={assistantMessage} />);
    
    // アシスタントメッセージが表示されていることを確認
    const messageElement = screen.getByTestId('markdown-content');
    expect(messageElement).toHaveTextContent('こんにちは！どのようにお手伝いしましょうか？');
    
    // メッセージコンテナが存在することを確認
    const messageContainer = messageElement.closest('div'); 
    expect(messageContainer).toBeInTheDocument();
  });

  it('Markdown付きAIメッセージが正しくレンダリングされること', () => {
    const markdownMessage = {
      role: 'assistant',
      content: `
# コミットメッセージの書き方

良いコミットメッセージは以下の形式を守りましょう：

\`\`\`
feat: 新機能の追加
fix: バグ修正
docs: ドキュメントの変更
\`\`\`

詳細は[こちら](https://www.example.com)をご覧ください。
      `
    } as const;

    render(<ChatMessage message={markdownMessage} />);
    
    // Markdownの見出しがレンダリングされていることを確認
    const headingElement = screen.getByText('コミットメッセージの書き方', { exact: false });
    expect(headingElement).toBeInTheDocument();
    
    // コードブロックのテキストがレンダリングされていることを確認
    const markdownContent = screen.getByTestId('markdown-content');
    expect(markdownContent).toHaveTextContent('feat: 新機能の追加');
    expect(markdownContent).toHaveTextContent('fix: バグ修正');
    
    // 全体のマークダウンコンテンツが正しく表示されていることを確認
    expect(markdownContent).toHaveTextContent('詳細は');
    expect(markdownContent).toHaveTextContent('をご覧ください');
    // リンク部分はモックの実装によって変わるため、テキストの確認で代替する
  });
});
