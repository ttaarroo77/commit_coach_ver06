"use client"
import { useState, KeyboardEvent } from "react"
import {
  Trash2, Plus, Clock, Braces, ChevronDown, ChevronRight, Calendar,
  ArrowUp, ArrowDown
} from "lucide-react"
import clsx from "clsx"

type Props = {
  indent?: number
  hasChildren?: boolean
  expanded?: boolean
  onToggle?: () => void
  title: string
  onTitleChange: (v: string) => void
  onAdd?: () => void
  onBreakdown?: () => void
  onDelete: () => void
  onClock?: () => void
  startTime?: string
  endTime?: string
  onTimeChange?: (startTime: string, endTime: string) => void
  completed?: boolean
  onToggleComplete?: () => void
  isSubtask?: boolean
  dragHandleProps?: any
  // タスク移動機能用の新しいProps
  onMoveUp?: () => void
  onMoveDown?: () => void
  // タスクが属するグループを識別するためのID
  groupId?: string
}

export const DashboardItemRow = ({
  indent = 0,
  hasChildren,
  expanded,
  onToggle,
  title,
  onTitleChange,
  onAdd,
  onBreakdown,
  onDelete,
  onClock,
  startTime,
  endTime,
  onTimeChange,
  completed,
  onToggleComplete,
  isSubtask,
  dragHandleProps,
  onMoveUp,
  onMoveDown,
  groupId
}: Props) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(title)

  const finish = () => {
    onTitleChange(draft.trim() || title)
    setEditing(false)
  }
  const key = (e: KeyboardEvent) => {
    if (e.key === "Enter") finish()
    if (e.key === "Escape") {
      setDraft(title)
      setEditing(false)
    }
  }

  return (
    <div 
      className="flex items-center gap-1 py-0.5 hover:bg-gray-50 rounded" 
      style={{ paddingLeft: indent }}
    >
      {/* ドラッグハンドル */}
      {dragHandleProps && (
        <div className="cursor-grab px-1" {...dragHandleProps}>
          <span className="text-gray-400 text-xs">::::</span>
        </div>
      )}

      {/* 矢印 */}
      {hasChildren ? (
        <button onClick={onToggle} className="p-1 hover:bg-gray-100 rounded">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      ) : (
        <div style={{ width: 24 }} />
      )}

      {/* チェック */}
      <input
        type="checkbox"
        checked={completed}
        onChange={onToggleComplete}
        className="mr-1 accent-black"
      />

      {/* タイトル */}
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={finish}
          onKeyDown={key}
          className="flex-1 border rounded px-1 py-0.5 text-sm"
        />
      ) : (
        <span
          onDoubleClick={() => setEditing(true)}
          className={clsx("flex-1 text-sm", completed && "line-through text-gray-400")}
        >
          {title}
          {startTime && endTime && (
            <span className="ml-2 text-xs text-gray-500">{startTime}〜{endTime}</span>
          )}
        </span>
      )}

      {/* アイコン群 */}
      {onTimeChange && (
        <button onClick={() => {
          const newStart = prompt("開始時間 (HH:MM)", startTime || "") || startTime || "";
          const newEnd = prompt("終了時間 (HH:MM)", endTime || "") || endTime || "";
          onTimeChange(newStart, newEnd);
        }} className="p-1 hover:bg-gray-100 rounded">
          <Calendar size={16} />
        </button>
      )}
      {!isSubtask && onAdd && (
        <button onClick={onAdd} className="p-1 hover:bg-gray-100 rounded">
          <Plus size={16} />
        </button>
      )}
      {!isSubtask && onBreakdown && (
        <button onClick={onBreakdown} className="p-1 hover:bg-gray-100 rounded">
          <Braces size={16} />
        </button>
      )}
      {onClock && (
        <button onClick={onClock} className="p-1 hover:bg-gray-100 rounded">
          <Clock size={16} />
        </button>
      )}
      {/* タスク操作ボタングループ（移動と削除） */}
      <div className="flex items-center">
        {/* タスク移動ボタン - すべてのタスクとサブタスクに表示 */}
        {onMoveUp && (
          <button 
            onClick={onMoveUp} 
            className="p-1 hover:bg-gray-100 rounded" 
            title="上に移動"
          >
            <ArrowUp size={16} />
          </button>
        )}
        {onMoveDown && (
          <button 
            onClick={onMoveDown} 
            className="p-1 hover:bg-gray-100 rounded" 
            title="下に移動"
          >
            <ArrowDown size={16} />
          </button>
        )}
        <button onClick={onDelete} className="p-1 hover:bg-gray-100 rounded">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
