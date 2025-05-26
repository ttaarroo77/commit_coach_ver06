"use client";
import { useState, useRef, useEffect, KeyboardEvent, Dispatch, SetStateAction } from "react";
import { cn } from "@/lib/utils";

// 型定義をエクスポートして他のコンポーネントから使えるようにする
export interface EditableTextProps {
  value: string;
  onChange: (newValue: string) => void;
  className?: string;
  placeholder?: string;
  onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void;
  isEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
}

export const EditableText = ({
  value,
  onChange,
  className,
  placeholder = "テキストを入力",
  onClick,
  isEditing,
  onEditingChange,
}: EditableTextProps) => {
  // 外部制御モード（isEditingとonEditingChangeが両方提供されている場合）と内部状態モードを切り替え
  const isControlled = isEditing !== undefined && onEditingChange !== undefined;
  const [internalEditing, setInternalEditing] = useState(false);
  
  // 実際の編集状態（外部制御または内部状態）
  const editing = isControlled ? isEditing : internalEditing;
  
  // 編集状態の変更ハンドラ
  const setEditing = (value: boolean) => {
    if (isControlled) {
      onEditingChange?.(value);
    } else {
      setInternalEditing(value);
    }
  };
  
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  /* 外から value が変わったら draft も同期 */
  useEffect(() => setDraft(value), [value]);

  /* 外から isEditing が変わったら内部状態も同期 */
  useEffect(() => {
    if (isEditing !== undefined && !isControlled) {
      setInternalEditing(isEditing);
    }
  }, [isEditing, isControlled]);

  /* 編集開始で auto-focus */
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    const v = draft.trim();
    if (v && v !== value) onChange(v);
    setEditing(false);
  };

  return editing ? (
    <input
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
          setDraft(value);
          setEditing(false);
        }
      }}
      className={cn(
        "w-full border border-gray-300 rounded px-1 text-sm",
        className
      )}
    />
  ) : (
    <span
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      onClick={onClick}
      className={cn(
        "cursor-text break-all",
        !value && "text-gray-400",
        className
      )}
    >
      {value || placeholder}
    </span>
  );
};
