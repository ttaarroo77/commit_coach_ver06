import type { Meta, StoryObj } from '@storybook/react'
import { EditableText } from '../components/ui/editable-text'
import { useState } from 'react'

const meta: Meta<typeof EditableText> = {
  title: 'Components/EditableText',
  component: EditableText,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof EditableText>

export const Default: Story = {
  args: {
    value: 'クリックして編集',
    onChange: (value) => console.log('Changed to:', value),
  },
}

export const Empty: Story = {
  args: {
    value: '',
    placeholder: 'プレースホルダーテキスト',
    onChange: (value) => console.log('Changed to:', value),
  },
}

export const Controlled: Story = {
  render: (args) => {
    const [editing, setEditing] = useState(false)
    const [value, setValue] = useState('外部制御モード')
    
    return (
      <div className="flex flex-col gap-4 p-4 border rounded w-[300px]">
        <EditableText
          value={value}
          onChange={setValue}
          isEditing={editing}
          onEditingChange={setEditing}
        />
        <div className="flex gap-2">
          <button 
            className="px-2 py-1 bg-blue-500 text-white rounded" 
            onClick={() => setEditing(true)}
          >
            編集開始
          </button>
          <div className="text-sm text-gray-500">
            編集中: {editing ? 'はい' : 'いいえ'}
          </div>
        </div>
      </div>
    )
  }
}

export const WithCustomStyles: Story = {
  args: {
    value: 'カスタムスタイル',
    onChange: (value) => console.log('Changed to:', value),
    className: 'text-blue-600 font-bold text-lg',
  },
}
