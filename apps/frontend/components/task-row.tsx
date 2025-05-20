import { ChevronDown, ChevronRight } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface TaskRowProps {
  level: 1 | 2 | 3
  expanded?: boolean
  hasChildren?: boolean
  checked?: boolean
  title: string
  onToggle?: () => void
  onCheck?: () => void
  children?: React.ReactNode
}

export const TaskRow = ({
  level,
  expanded,
  hasChildren,
  checked,
  title,
  onToggle,
  onCheck,
  children,
}: TaskRowProps) => {
  const pad = level === 1 ? "pl-4" : level === 2 ? "pl-8" : "pl-12"

  return (
    <>
      <div
        className={cn(
          "group flex items-center h-9 pr-4",
          pad,
          "hover:bg-gray-50"
        )}
      >
        {/* Chevron */}
        {hasChildren ? (
          <button
            onClick={onToggle}
            className="mr-1 w-4 h-4 text-gray-600 hover:text-blue-600"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="mr-1 w-4 h-4" />
        )}

        {/* Checkbox */}
        <Checkbox checked={checked} onCheckedChange={onCheck} className="mr-2 h-4 w-4" />

        {/* Title */}
        <span
          className={cn(
            "truncate",
            level === 1 && "font-semibold text-base",
            level === 2 && "font-medium text-sm",
            level === 3 && "text-sm"
          )}
        >
          {title}
        </span>
      </div>

      {/* 子階層 */}
      {expanded && children}
    </>
  )
}
