"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, ChevronDown, ChevronRight, Clock } from "lucide-react"
import { TimeRangePicker } from "./time-range-picker"

type Props = {
  id: string
  title: string
  completed?: boolean
  expanded?: boolean
  hasChildren?: boolean
  level: 1 | 2 | 3
  startTime?: string
  endTime?: string
  /** handlers */
  onToggleExpand?: () => void
  onToggleComplete?: () => void
  onDelete?: () => void
  onAddChild?: () => void
  onTimeChange?: (start: string, end: string) => void
  /** DnD */
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

export const HierarchicalTaskItem = ({
  id,
  title,
  completed = false,
  expanded = false,
  hasChildren = false,
  level,
  startTime,
  endTime,
  onToggleExpand,
  onToggleComplete,
  onDelete,
  onAddChild,
  onTimeChange,
  dragHandleProps,
}: Props) => {
  /** 時間ピッカーの開閉 */
  const [open, setOpen] = useState(false)

  /** 表示用テキスト */
  const timeLabel =
    startTime && endTime ? `${startTime} - ${endTime}` : <span className="text-gray-400">時間を設定</span>

  return (
    <div
      className={`flex items-center bg-white ${
        level === 1 ? "px-3 py-2" : level === 2 ? "pl-8 pr-3 py-2" : "pl-16 pr-3 py-1.5"
      } border-b last:border-b-0`}
    >
      {/* 展開 / 折りたたみ */}
      {hasChildren ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 mr-1 text-gray-600"
          onClick={onToggleExpand}
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </Button>
      ) : (
        <div className="w-6 mr-1" /> /* アイコン位置を合わせるためのダミー */
      )}

      {/* 完了チェック */}
      <Checkbox
        checked={completed}
        onCheckedChange={onToggleComplete}
        className="h-4 w-4 mr-3"
        id={`chk-${id}`}
      />

      {/* タイトル */}
      <label
        htmlFor={`chk-${id}`}
        className={`flex-1 select-none truncate ${
          completed ? "line-through text-gray-400" : "text-gray-800"
        }`}
      >
        {title}
      </label>

      {/* 時間表示 / 設定 */}
      <Button
        variant="ghost"
        size="sm"
        className="mr-2 text-xs font-normal flex items-center gap-1"
        onClick={() => setOpen(true)}
      >
        <Clock size={14} />
        {timeLabel}
      </Button>

      {/* 子要素追加 */}
      {onAddChild && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 mr-1 text-gray-500"
          onClick={onAddChild}
          aria-label="add child"
        >
          <Plus size={14} />
        </Button>
      )}

      {/* 削除 */}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-red-500"
          onClick={onDelete}
          aria-label="delete"
        >
          <Trash2 size={14} />
        </Button>
      )}

      {/* DnD ハンドル */}
      {dragHandleProps && (
        <div {...dragHandleProps} className="cursor-move ml-1 w-3 h-3" />
      )}

      {/* 時間ピッカー（モーダル） */}
      <TimeRangePicker
        open={open}
        defaultStart={startTime}
        defaultEnd={endTime}
        onOpenChange={setOpen}
        onSave={(s, e) => onTimeChange?.(s, e)}
      />
    </div>
  )
}
