"use client"
import { Sidebar } from "@/components/sidebar"
import { AICoachSidebar } from "@/components/ai-coach-sidebar"
import { NestedList } from "@/components/NestedList"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useProjects } from "@/store/useProjects"

export default function ProjectsPage() {
  const addProject = useProjects((s) => s.addProject)

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 max-w-5xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold mb-2"># プロジェクト一覧</h1>

        <NestedList />

        <div className="flex justify-center">
          <Button variant="outline" className="border-dashed" onClick={addProject}>
            <Plus className="mr-2 h-4 w-4" />
            新しいプロジェクトを追加
          </Button>
        </div>
      </main>
      <AICoachSidebar defaultOpen={false} />
    </div>
  )
}
