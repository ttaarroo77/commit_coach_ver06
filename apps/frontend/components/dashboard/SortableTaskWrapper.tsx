"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"

type SortableRowProps = {
  id: string
  children: React.ReactNode
}

/**
 * ドラッグ＆ドロップ可能な行コンテナ
 * 行の高さを固定して、ドラッグ中にレイアウトが崩れるのを防止する
 */
export const SortableRow = ({ id, children }: SortableRowProps) => {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition, 
    isDragging 
  } = useSortable({ id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    height: "48px",          // 行高を固定（px or rem で）
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={cn(isDragging && "opacity-70")}
    >
      {children}
    </div>
  )
}

// 後方互換性のために古い名前もエクスポート
export const SortableTaskWrapper = SortableRow
