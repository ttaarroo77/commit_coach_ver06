"use client"

import { useState, useRef, useEffect, KeyboardEvent } from "react"
import { cn } from "@/lib/utils"

interface EditableTextProps {
  value: string
  onChange: (newValue: string) => void
  className?: string
  placeholder?: string
  onBlur?: () => void
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void
}

export const EditableText = ({
  value,
  onChange,
  className,
  placeholder = "タスク名を入力",
  onBlur,
  onKeyDown,
}: EditableTextProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const inputRef = useRef<HTMLDivElement>(null)

  // 外部から値が変更された場合、ローカルの状態も更新
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // 編集モードになったらフォーカスを当てる
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      
      // カーソルを末尾に配置
      const selection = window.getSelection()
      const range = document.createRange()
      
      if (selection && inputRef.current.childNodes.length > 0) {
        range.selectNodeContents(inputRef.current)
        range.collapse(false) // カーソルを末尾に
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  }, [isEditing])

  const handleDoubleClick = () => {
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (localValue.trim() !== value.trim()) {
      onChange(localValue)
    }
    onBlur?.()
  }

  const handleInput = () => {
    if (inputRef.current) {
      setLocalValue(inputRef.current.innerText)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      inputRef.current?.blur()
    } else if (e.key === "Escape") {
      e.preventDefault()
      setLocalValue(value) // 編集キャンセル
      inputRef.current?.blur()
    }
    
    onKeyDown?.(e)
  }

  return (
    <div
      ref={inputRef}
      className={cn(
        "outline-none transition-colors",
        isEditing
          ? "bg-blue-50 px-2 py-1 rounded border border-blue-200"
          : "cursor-pointer",
        className
      )}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onDoubleClick={handleDoubleClick}
      onBlur={handleBlur}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
    >
      {localValue || <span className="text-gray-400">{placeholder}</span>}
    </div>
  )
}
