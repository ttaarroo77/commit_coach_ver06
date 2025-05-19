import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ChevronDown, ChevronRight } from "lucide-react"
import { Droppable, Draggable } from "react-beautiful-dnd"
import { Project } from "./project"
import { type TaskGroup as TaskGroupType } from "@/lib/dashboard-utils"

interface TaskGroupProps {
  group: TaskGroupType
  groupIndex: number
  onToggleExpand: (groupId: string) => void
  onAddProject: (groupId: string) => void
  onProjectDragEnd: (result: any) => void
}

export function TaskGroup({ group, groupIndex, onToggleExpand, onAddProject, onProjectDragEnd }: TaskGroupProps) {
  return (
    <Draggable key={group.id} draggableId={group.id} index={groupIndex}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps} className="mb-6">
          <Card>
            <CardHeader className="bg-gray-50 p-4 flex flex-row items-center justify-between">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-6 w-6 mr-2"
                  onClick={() => onToggleExpand(group.id)}
                >
                  {group.expanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </Button>
                <CardTitle className="text-lg font-bold">
                  {group.id === "today" ? "### 今日のタスク" : "### 未定のタスク"}
                </CardTitle>
              </div>
            </CardHeader>

            {group.expanded && (
              <CardContent className="p-4">
                <Droppable droppableId={group.id} type="project">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {group.projects.map((project, projectIndex) => (
                        <Project
                          key={project.id}
                          project={project}
                          projectIndex={projectIndex}
                          groupId={group.id}
                          onProjectDragEnd={onProjectDragEnd}
                        />
                      ))}
                      {provided.placeholder}

                      <div className="mt-4">
                        <Button
                          variant="outline"
                          className="border-dashed w-full"
                          onClick={() => onAddProject(group.id)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          新しいプロジェクトを追加
                        </Button>
                      </div>
                    </div>
                  )}
                </Droppable>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </Draggable>
  )
}
