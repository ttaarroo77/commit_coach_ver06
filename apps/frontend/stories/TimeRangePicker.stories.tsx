import type { Meta, StoryObj } from '@storybook/react'
import { TimeRangePicker } from '../components/dashboard/time-range-picker'
import { useState } from 'react'

const meta: Meta<typeof TimeRangePicker> = {
  title: 'Components/TimeRangePicker',
  component: TimeRangePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TimeRangePicker>

// デフォルトのストーリーは単純なコンポーネントの状態を表示するのに向いていません
// TimeRangePickerは常にダイアログとして表示されるため、制御可能なバージョンを提供します
export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    const [timeRange, setTimeRange] = useState({ start: '09:00', end: '10:00' })
    
    return (
      <div className="flex flex-col gap-4 p-4 border rounded">
        <div>
          <p className="mb-2">現在の時間範囲: {timeRange.start} - {timeRange.end}</p>
          <button 
            className="px-3 py-1.5 bg-blue-500 text-white rounded"
            onClick={() => setOpen(true)}
          >
            時間を設定
          </button>
        </div>
        
        <TimeRangePicker
          open={open}
          defaultStart={timeRange.start}
          defaultEnd={timeRange.end}
          onOpenChange={setOpen}
          onSave={(start, end) => setTimeRange({ start, end })}
        />
      </div>
    )
  }
}

export const Empty: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    const [timeRange, setTimeRange] = useState({ start: '', end: '' })
    
    return (
      <div className="flex flex-col gap-4 p-4 border rounded">
        <div>
          <p className="mb-2">
            現在の時間範囲: {timeRange.start && timeRange.end 
              ? `${timeRange.start} - ${timeRange.end}` 
              : '未設定'}
          </p>
          <button 
            className="px-3 py-1.5 bg-blue-500 text-white rounded"
            onClick={() => setOpen(true)}
          >
            時間を設定
          </button>
        </div>
        
        <TimeRangePicker
          open={open}
          defaultStart={timeRange.start}
          defaultEnd={timeRange.end}
          onOpenChange={setOpen}
          onSave={(start, end) => setTimeRange({ start, end })}
        />
      </div>
    )
  }
}
