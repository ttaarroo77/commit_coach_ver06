import type { Meta, StoryObj } from '@storybook/react';
import ChatMessage from '@/components/chat/chat-message';

const meta: Meta<typeof ChatMessage> = {
  title: 'Chat/ChatMessage',
  component: ChatMessage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ChatMessage>;

export const UserMessage: Story = {
  args: {
    message: {
      role: 'user',
      content: 'こんにちは、今日のタスクを教えてください。',
    },
  },
};

export const AssistantMessage: Story = {
  args: {
    message: {
      role: 'assistant',
      content: 'こんにちは！今日のタスクは以下の通りです：\n\n1. プロジェクト計画の作成\n2. チームミーティング（14:00-15:00）\n3. ドキュメント更新',
    },
  },
};

export const AssistantMessageWithCode: Story = {
  args: {
    message: {
      role: 'assistant',
      content: '以下のコードを試してみてください：\n\n```javascript\nfunction sayHello() {\n  console.log("こんにちは、世界！");\n}\n\nsayHello();\n```\n\nこれで「こんにちは、世界！」とコンソールに表示されます。',
    },
  },
};

export const LongMessage: Story = {
  args: {
    message: {
      role: 'assistant',
      content: '# プロジェクト計画\n\n## 概要\nこのプロジェクトは、AIを活用したタスク管理システムの開発を目的としています。\n\n## 主な機能\n- ユーザー認証\n- タスク作成・編集・削除\n- AIによるタスク分析と提案\n- レポート生成\n\n## スケジュール\n1. 要件定義：2週間\n2. 設計：3週間\n3. 開発：8週間\n4. テスト：3週間\n5. デプロイ：1週間\n\n## 技術スタック\n- フロントエンド：React, TypeScript\n- バックエンド：Node.js, Express\n- データベース：PostgreSQL\n- AI：OpenAI API',
    },
  },
};
