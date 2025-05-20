"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, ChevronDown, ChevronRight, Clock, GripVertical } from "lucide-react"
import { TimeRangePicker } from "./time-range-picker"
import { EditableText } from "@/components/ui/editable-text"

type Props = {
  id: string
  title: string
  completed?: boolean
  expanded?: boolean
  hasChildren?: boolean
  level: 1 | 2 | 3
  startTime?: string
  endTime?: string
  sort_order?: number
  /** handlers */
  onToggleExpand?: () => void
  onToggleComplete?: () => void
  onDelete?: () => void
  onAddChild?: () => void
  onTimeChange?: (start: string, end: string) => void
  onTitleChange?: (newTitle: string) => void
  /** DnD */
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

export const EditableHierarchicalTaskItem = ({
  id,
  title,
  completed = false,
  expanded = false,
  hasChildren = false,
  level,
  startTime,
  endTime,
  sort_order,
  onToggleExpand,
  onToggleComplete,
  onDelete,
  onAddChild,
  onTimeChange,
  onTitleChange,
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
      } border-b last:border-b-0 ${level === 3 ? "bg-gray-50" : ""}`}
    >
      {/* ドラッグハンドル */}
      {dragHandleProps && (
        <div {...dragHandleProps} className="cursor-move p-1 text-gray-400 hover:text-gray-600">
          <GripVertical size={16} />
        </div>
      )}

      {/* 展開 / 折りたたみ */}
      {hasChildren ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 mr-2 p-1 text-blue-600 hover:bg-blue-100/70"
          onClick={onToggleExpand}
        >
          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </Button>
      ) : (
        <div className="w-8 mr-2" /> /* アイコン位置を合わせるためのダミー */
      )}

      {/* 完了チェック */}
      <Checkbox
        checked={completed}
        onCheckedChange={(checked) => {
          // Radix-style Checkboxは「checked = true | false | "indeterminate"」という型
          if (checked !== "indeterminate") onToggleComplete?.();
        }}
        onClick={(e) => e.stopPropagation()}  // クリックイベントの伝播を停止
        className="h-4 w-4 mr-3"
        id={`chk-${id}`}
      />

      {/* 編集可能なタイトル */}
      <div className="flex-1 select-none truncate">
        <EditableText 
          value={title}
          onChange={(newValue) => onTitleChange?.(newValue)}
          onClick={(e) => e.stopPropagation()}  // クリックイベントの伝播を停止
          className={completed ? "line-through text-gray-400" : "text-gray-800"}
          placeholder="タスク名を入力"
        />
      </div>

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

      {/* 子要素追加（サブタスクには表示しない） */}
      {onAddChild && level !== 3 && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 mr-2 p-1 text-green-600 hover:bg-green-100/70"
          onClick={onAddChild}
          aria-label="add child"
        >
          <Plus size={18} strokeWidth={2.25} />
        </Button>
      )}

      {/* 削除 */}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-1 text-red-600 hover:bg-red-100/70"
          onClick={onDelete}
          aria-label="delete"
        >
          <Trash2 size={18} />
        </Button>
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
