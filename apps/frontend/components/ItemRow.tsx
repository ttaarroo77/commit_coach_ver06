"use client"
import { useState, KeyboardEvent } from "react"
import {
  Trash2, Plus, Clock, Braces, ChevronDown, ChevronRight,
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
  onClock: () => void
  completed?: boolean
  onToggleComplete?: () => void
  isSubtask?: boolean
}

export const ItemRow = ({
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
  completed,
  onToggleComplete,
  isSubtask,
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
        </span>
      )}

      {/* アイコン群 */}
      {!isSubtask && (
        <button onClick={onAdd} className="p-1 hover:bg-gray-100 rounded">
          <Plus size={16} />
        </button>
      )}
      {!isSubtask && (
        <button onClick={onBreakdown} className="p-1 hover:bg-gray-100 rounded">
          <Braces size={16} />
        </button>
      )}
      <button onClick={onClock} className="p-1 hover:bg-gray-100 rounded">
        <Clock size={16} />
      </button>
      <button onClick={onDelete} className="p-1 hover:bg-gray-100 rounded">
        <Trash2 size={16} />
      </button>
    </div>
  )
}
