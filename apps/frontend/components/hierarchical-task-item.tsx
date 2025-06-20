// apps/frontend/components/hierarchical-task-item.tsx
"use client"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Plus, Trash2, CheckSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { ComponentProps } from "react"

interface Props extends ComponentProps<"div"> {
  title: string
  completed: boolean
  expanded?: boolean
  level: 1 | 2 | 3
  hasChildren?: boolean
  startTime?: string
  endTime?: string
  onToggleExpand?: () => void
  onToggleComplete?: () => void
  onDelete?: () => void
  onAddChild?: () => void
  onTimeChange?: (start: string, end: string) => void
  dragHandleProps?: Record<string, unknown>
}
export const HierarchicalTaskItem = ({
  title,
  completed,
  expanded,
  level,
  hasChildren,
  onToggleExpand,
  onToggleComplete,
  onDelete,
  onAddChild,
  startTime,
  endTime,
  onTimeChange,
  dragHandleProps,
  className,
  ...rest
}: Props) => {
  const timeInput =
    onTimeChange && level !== 3 ? (
      <div className="ml-2 flex items-center space-x-1">
        <input
          type="time"
          className="border rounded text-xs px-1 py-0.5"
          value={startTime ?? ""}
          onChange={(e) => onTimeChange(e.target.value, endTime ?? "")}
        />
        <span className="text-xs">〜</span>
        <input
          type="time"
          className="border rounded text-xs px-1 py-0.5"
          value={endTime ?? ""}
          onChange={(e) => onTimeChange(startTime ?? "", e.target.value)}
        />
      </div>
    ) : null

  return (
    <div
      className={cn(
        "flex items-center justify-between px-2 py-1",
        level === 1 && "bg-gray-50",
        level === 2 && "pl-6",
        level === 3 && "pl-10",
        className,
      )}
      {...rest}
    >
      <div className="flex items-center" {...dragHandleProps}>
        {hasChildren && (
          <Button variant="ghost" size="sm" className="p-0 h-6 w-6" onClick={onToggleExpand}>
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-6 w-6 text-green-600"
          onClick={onToggleComplete}
        >
          {completed ? <CheckSquare className="h-4 w-4" /> : <div className="h-4 w-4 border" />}
        </Button>
        <span className={cn("ml-2", completed && "line-through text-gray-400")}>{title}</span>
        {timeInput}
      </div>
      <div className="flex items-center space-x-1">
        {onAddChild && (
          <Button variant="ghost" size="sm" className="p-0 h-6 w-6" onClick={onAddChild}>
            <Plus className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button variant="ghost" size="sm" className="p-0 h-6 w-6 text-red-500" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}




// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Checkbox } from "@/components/ui/checkbox"
// import { ChevronDown, ChevronRight, Plus, Trash2, Clock } from "lucide-react"
// import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd"
// import { cn } from "@/lib/utils"

// interface HierarchicalTaskItemProps {
//   id: string
//   title: string
//   completed?: boolean
//   level: number // 1: プロジェクト, 2: タスク, 3: サブタスク
//   expanded?: boolean
//   hasChildren?: boolean
//   startTime?: string
//   endTime?: string
//   isSubtask?: boolean
//   onToggleExpand?: () => void
//   onToggleComplete?: () => void
//   onDelete?: () => void
//   onAddChild?: () => void
//   onTimeChange?: (startTime: string, endTime: string) => void
//   dragHandleProps?: DraggableProvidedDragHandleProps
//   className?: string
// }

// export function HierarchicalTaskItem({
//   id,
//   title,
//   completed = false,
//   level,
//   expanded = false,
//   hasChildren = false,
//   startTime,
//   endTime,
//   isSubtask = false,
//   onToggleExpand,
//   onToggleComplete,
//   onDelete,
//   onAddChild,
//   onTimeChange,
//   dragHandleProps,
//   className,
// }: HierarchicalTaskItemProps) {
//   const [isEditing, setIsEditing] = useState(false)
//   const [timeStart, setTimeStart] = useState(startTime || "")
//   const [timeEnd, setTimeEnd] = useState(endTime || "")

//   const handleTimeChange = () => {
//     if (onTimeChange) {
//       onTimeChange(timeStart, timeEnd)
//     }
//     setIsEditing(false)
//   }

//   // レベルに応じたパディングを計算
//   const getPadding = () => {
//     return `pl-${level * 4}`
//   }

//   return (
//     <div
//       className={cn(
//         "flex flex-col border-b last:border-b-0",
//         getPadding(),
//         completed ? "bg-gray-50" : "",
//         className
//       )}
//     >
//       <div className="flex items-center py-2 px-2">
//         {/* ドラッグハンドル */}
//         <div {...dragHandleProps} className="mr-1 cursor-grab">
//           <div className="h-4 w-1 rounded-full bg-gray-300" />
//         </div>

//         {/* 展開/折りたたみボタン (レベル3のサブタスクでは表示しない) */}
//         {level < 3 && (
//           <Button
//             variant="ghost"
//             size="sm"
//             className="p-0 h-6 w-6 mr-1"
//             onClick={onToggleExpand}
//             disabled={!hasChildren}
//           >
//             {hasChildren ? (
//               expanded ? (
//                 <ChevronDown className="h-4 w-4" />
//               ) : (
//                 <ChevronRight className="h-4 w-4" />
//               )
//             ) : (
//               <div className="w-4" />
//             )}
//           </Button>
//         )}

//         {/* チェックボックス */}
//         <Checkbox
//           checked={completed}
//           onCheckedChange={onToggleComplete}
//           className="mr-2 h-4 w-4"
//           id={`task-${id}`}
//         />

//         {/* タイトル */}
//         <label
//           htmlFor={`task-${id}`}
//           className={cn("flex-1 text-sm cursor-pointer", completed ? "line-through text-gray-500" : "")}
//         >
//           {title}
//         </label>

//         {/* 時間表示 (レベル1のプロジェクトとレベル2のタスクのみ) */}
//         {(level === 1 || level === 2) && (
//           <>
//             {isEditing ? (
//               <div className="flex items-center space-x-1 mr-2">
//                 <input
//                   type="time"
//                   value={timeStart}
//                   onChange={(e) => setTimeStart(e.target.value)}
//                   className="w-24 text-xs p-1 border rounded"
//                 />
//                 <span className="text-xs">-</span>
//                 <input
//                   type="time"
//                   value={timeEnd}
//                   onChange={(e) => setTimeEnd(e.target.value)}
//                   className="w-24 text-xs p-1 border rounded"
//                 />
//                 <Button size="sm" variant="outline" className="text-xs h-6" onClick={handleTimeChange}>
//                   保存
//                 </Button>
//               </div>
//             ) : (
//               <>
//                 {(startTime || endTime) && (
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="flex items-center text-xs text-gray-500 mr-2 h-6"
//                     onClick={() => setIsEditing(true)}
//                   >
//                     <Clock className="h-3 w-3 mr-1" />
//                     {startTime || "--:--"} - {endTime || "--:--"}
//                   </Button>
//                 )}
//               </>
//             )}
//           </>
//         )}

//         {/* 子要素追加ボタン (レベル3のサブタスクでは表示しない) */}
//         {level < 3 && (
//           <Button
//             variant="ghost"
//             size="sm"
//             className="text-gray-500 hover:text-gray-700 h-6 w-6 p-0 mr-1"
//             onClick={onAddChild}
//           >
//             <Plus className="h-3.5 w-3.5" />
//           </Button>
//         )}

//         {/* 削除ボタン */}
//         <Button
//           variant="ghost"
//           size="sm"
//           className="text-gray-500 hover:text-red-500 h-6 w-6 p-0"
//           onClick={onDelete}
//         >
//           <Trash2 className="h-3.5 w-3.5" />
//         </Button>
//       </div>
//     </div>
//   )
// }
