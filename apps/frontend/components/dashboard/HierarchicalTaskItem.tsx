// apps/frontend/components/dashboard/HierarchicalTaskItem.tsx

"use client"

import * as React from "react"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, ChevronDown, ChevronRight, Clock, Pen, Check, X, ArrowUp, ArrowDown } from "lucide-react"
import { TimeRangePicker } from "./time-range-picker"
import { cn } from "@/lib/utils"

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
  onTitleChange?: (newTitle: string) => void
  /** DnD */
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
  /** タスク移動ボタン用 */
  groupId?: string
  onMoveUp?: () => void
  onMoveDown?: () => void
}

// アイコンサイズを統一
const ICON_SIZE = 18

// ボタンスタイルを統一
const iconBtn = `
  p-1.5 w-auto h-auto rounded-md 
  opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto 
  transition-opacity duration-150
`

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
  onTitleChange,
  dragHandleProps,
  groupId,
  onMoveUp,
  onMoveDown,
}: Props) => {
  /** 時間ピッカーの開閉 */
  const [open, setOpen] = useState(false)
  
  /** 編集モード用ステート */
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(title)
  
  /** 編集モード切替／保存ロジック */
  const beginEdit = (e: React.MouseEvent) => { e.stopPropagation(); setDraft(title); setEditing(true) }
  const cancelEdit = () => setEditing(false)
  const commitEdit = () => {
    const v = draft.trim()
    if (v && v !== title) onTitleChange?.(v)
    setEditing(false)
  }

  /** 表示用テキスト */
  const timeLabel =
    startTime && endTime ? `${startTime} - ${endTime}` : <span className="text-gray-400">時間を設定</span>

  return (
    <div
      className={`group flex items-center bg-white ${
        level === 1 ? "px-3 py-2" : level === 2 ? "pl-8 pr-3 py-2" : "pl-16 pr-3 py-1.5"
      } border-b last:border-b-0 ${level === 3 ? "bg-gray-50" : ""}`}
    >
      {/* 展開 / 折りたたみ */}
      {hasChildren ? (
        <Button
          variant="ghost"
          size="sm"
          className="mr-2 text-blue-600 hover:bg-blue-100/70"
          onClick={onToggleExpand}
        >
          {expanded ? <ChevronDown size={ICON_SIZE} /> : <ChevronRight size={ICON_SIZE} />}
        </Button>
      ) : (
        <div className="w-8 mr-2" /> /* アイコン位置を合わせるためのダミー */
      )}

      {/* 完了チェック */}
      <Checkbox
        checked={completed}
        onCheckedChange={onToggleComplete}
        onClick={(e) => e.stopPropagation()}  // クリックイベントの伝播を停止
        onDoubleClick={(e) => e.stopPropagation()}  // ダブルクリックイベントの伝播も停止
        className="h-4 w-4 mr-3"
        id={`chk-${id}`}
      />

      {/* タイトル or 入力フォーム */}
      <div className="flex-1 truncate">
        {editing ? (
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              // IME入力中は無視する（isComposingがセットされる）
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault()
                commitEdit()
              }
              if (e.key === "Escape") cancelEdit()
            }}
            onBlur={commitEdit}
            className="border rounded px-1 w-full text-sm"
            autoFocus
          />
        ) : (
          <span
            className={completed ? "line-through text-gray-400" : "text-gray-800"}
          >
            {title}
          </span>
        )}
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
          size="sm"
          className={cn(iconBtn, "mr-2 text-green-600 hover:bg-green-100/70")}
          onClick={onAddChild}
          aria-label="add child"
        >
          <Plus size={ICON_SIZE} strokeWidth={2.25} />
        </Button>
      )}

      {/* 編集 or 保存／キャンセル */}
      {editing ? (
        <>
          <Button
            variant="ghost" size="sm"
            className="text-green-600 hover:bg-green-100/70"
            onClick={commitEdit} aria-label="save"
          >
            <Check size={ICON_SIZE} strokeWidth={2.25}/>
          </Button>
          <Button
            variant="ghost" size="sm"
            className="text-gray-500 hover:bg-gray-100/70"
            onClick={cancelEdit} aria-label="cancel"
          >
            <X size={ICON_SIZE} strokeWidth={2.25}/>
          </Button>
        </>
      ) : (
        <Button
          variant="ghost" size="sm"
          className={cn(iconBtn, "mr-2 text-blue-600 hover:bg-blue-100/70")}
          onClick={beginEdit} aria-label="edit"
        >
          <Pen size={ICON_SIZE} strokeWidth={2.25}/>
        </Button>
      )}

      {/* 矢印ボタン（上）- 未定のタスクから今日のタスクへ */}
      {groupId === "unscheduled" && onMoveUp && (
        <Button
          variant="ghost"
          size="sm"
          className={cn(iconBtn, "mr-2 text-blue-600 hover:bg-blue-100/70")}
          onClick={onMoveUp}
          aria-label="move to today"
        >
          <ArrowUp size={ICON_SIZE} />
        </Button>
      )}

      {/* 矢印ボタン（下）- 今日のタスクから未定のタスクへ */}
      {groupId === "today" && onMoveDown && (
        <Button
          variant="ghost"
          size="sm"
          className={cn(iconBtn, "mr-2 text-blue-600 hover:bg-blue-100/70")}
          onClick={onMoveDown}
          aria-label="move to unscheduled"
        >
          <ArrowDown size={ICON_SIZE} />
        </Button>
      )}
      
      {/* 削除 */}
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          className={cn(iconBtn, "text-red-600 hover:bg-red-100/70")}
          onClick={onDelete}
          aria-label="delete"
        >
          <Trash2 size={ICON_SIZE} />
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
