"use client";
import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  value: string;
  onChange: (newValue: string) => void;
  className?: string;
  placeholder?: string;
  onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void;
}

export const EditableText = ({
  value,
  onChange,
  className,
  placeholder = "テキストを入力",
  onClick,
}: EditableTextProps) => {
  const [editing, setEditing]   = useState(false);
  const [draft, setDraft]       = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  /* 外から value が変わったら draft も同期 */
  useEffect(() => setDraft(value), [value]);

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
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") { setDraft(value); setEditing(false); }
      }}
      className={cn(
        "w-full border border-gray-300 rounded px-1 text-sm",
        className
      )}
    />
  ) : (
    <span
      onDoubleClick={e => { e.stopPropagation(); setEditing(true); }}
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
