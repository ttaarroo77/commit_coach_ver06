import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import ToneSelector from '@/components/chat/tone-selector';

const meta: Meta<typeof ToneSelector> = {
  title: 'Chat/ToneSelector',
  component: ToneSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ToneSelector>;

// 基本的な使用例
export const Default: Story = {
  args: {
    value: 'friendly',
    onChange: (value) => console.log(`Selected tone: ${value}`),
  },
};

// インタラクティブな例
const InteractiveToneSelector = () => {
  const [tone, setTone] = useState<'friendly' | 'tough-love' | 'humor'>('friendly');
  
  return (
    <div className="p-4 bg-white rounded-md shadow">
      <ToneSelector 
        value={tone} 
        onChange={setTone} 
      />
      <div className="mt-4 p-2 bg-gray-100 rounded text-sm">
        <p>選択されたトーン: <strong>{tone}</strong></p>
        <p className="mt-2">
          {tone === 'friendly' && '👋 やさしく励ましながらコーチングします。'}
          {tone === 'tough-love' && '⚡ 厳しく、でも愛情を持ってコーチングします。'}
          {tone === 'humor' && '☕ ユーモアを交えながらコーチングします。'}
        </p>
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveToneSelector />,
};

// 各トーンのプリセット例
export const FriendlyTone: Story = {
  args: {
    value: 'friendly',
    onChange: (value) => console.log(`Selected tone: ${value}`),
  },
};

export const ToughLoveTone: Story = {
  args: {
    value: 'tough-love',
    onChange: (value) => console.log(`Selected tone: ${value}`),
  },
};

export const HumorTone: Story = {
  args: {
    value: 'humor',
    onChange: (value) => console.log(`Selected tone: ${value}`),
  },
};
