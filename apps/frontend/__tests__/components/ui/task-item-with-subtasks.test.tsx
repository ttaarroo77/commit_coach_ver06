import { render, screen, fireEvent } from '@testing-library/react'
import { TaskItemWithSubtasks } from '@/components/ui/task-item-with-subtasks'
import { Task } from '@/types/task'

// モックデータ
const mockTask: Task = {
  id: "task-1",
  title: "テストタスク",
  description: "テスト用のタスク説明",
  status: "in-progress",
  priority: "medium",
  tags: ["テスト", "サンプル"],
  subTasks: [
    { id: "subtask-1", title: "サブタスク1", completed: true },
    { id: "subtask-2", title: "サブタスク2", completed: false }
  ],
  createdAt: "2025-05-18T10:00:00Z",
  updatedAt: "2025-05-18T10:00:00Z"
}

// モック関数
const mockSubtaskAdd = jest.fn()
const mockSubtaskToggle = jest.fn()
const mockToggleCollapse = jest.fn()
const mockMenuOpen = jest.fn()

describe('TaskItemWithSubtasks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('タスクのタイトルとタグが正しく表示される', () => {
    render(<TaskItemWithSubtasks task={mockTask} />)
    
    // タイトルの確認
    expect(screen.getByText('テストタスク')).toBeInTheDocument()
    
    // タグの確認
    expect(screen.getByText('テスト')).toBeInTheDocument()
    expect(screen.getByText('サンプル')).toBeInTheDocument()
  })

  test('サブタスクが正しく表示される', () => {
    render(<TaskItemWithSubtasks task={mockTask} />)
    
    // サブタスクの確認
    expect(screen.getByText('サブタスク1')).toBeInTheDocument()
    expect(screen.getByText('サブタスク2')).toBeInTheDocument()
    
    // 完了状態の確認（チェックボックスの状態）
    const checkboxes = screen.getAllByRole('checkbox')
    // 最初のチェックボックスはタスク自体のもの、残りがサブタスク用
    expect(checkboxes.length).toBe(3)
    
    // サブタスク1は完了状態（チェック済み）
    expect(checkboxes[1]).toBeChecked()
    // サブタスク2は未完了状態（未チェック）
    expect(checkboxes[2]).not.toBeChecked()
  })

  test('折りたたみボタンをクリックするとonToggleCollapseが呼ばれる', () => {
    render(
      <TaskItemWithSubtasks 
        task={mockTask} 
        onToggleCollapse={mockToggleCollapse}
      />
    )
    
    // 折りたたみボタンをクリック
    const collapseButton = screen.getByRole('button', { name: '' })
    fireEvent.click(collapseButton)
    
    // onToggleCollapseが呼ばれたことを確認
    expect(mockToggleCollapse).toHaveBeenCalledWith('task-1')
  })

  test('サブタスク追加ボタンをクリックするとonSubtaskAddが呼ばれる', () => {
    render(
      <TaskItemWithSubtasks 
        task={mockTask} 
        onSubtaskAdd={mockSubtaskAdd}
      />
    )
    
    // サブタスク追加ボタンをクリック
    const addButton = screen.getByRole('button', { name: /サブタスクを追加/i })
    fireEvent.click(addButton)
    
    // onSubtaskAddが呼ばれたことを確認
    expect(mockSubtaskAdd).toHaveBeenCalledWith('task-1')
  })

  test('サブタスクのチェックボックスをクリックするとonSubtaskToggleが呼ばれる', () => {
    render(
      <TaskItemWithSubtasks 
        task={mockTask} 
        onSubtaskToggle={mockSubtaskToggle}
      />
    )
    
    // サブタスクのチェックボックスをクリック
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[2]) // サブタスク2のチェックボックス
    
    // onSubtaskToggleが呼ばれたことを確認
    expect(mockSubtaskToggle).toHaveBeenCalledWith('task-1', 'subtask-2', true)
  })

  test('メニューボタンをクリックするとonMenuOpenが呼ばれる', () => {
    render(
      <TaskItemWithSubtasks 
        task={mockTask} 
        onMenuOpen={mockMenuOpen}
      />
    )
    
    // メニューボタンをクリック
    const menuButton = screen.getAllByRole('button')[2] // 3番目のボタン（メニューボタン）
    fireEvent.click(menuButton)
    
    // onMenuOpenが呼ばれたことを確認
    expect(mockMenuOpen).toHaveBeenCalledWith('task-1')
  })

  test('進捗バーが正しく表示される', () => {
    render(<TaskItemWithSubtasks task={mockTask} />)
    
    // 進捗率の確認（サブタスク2つのうち1つ完了で50%）
    expect(screen.getByText('50% 完了')).toBeInTheDocument()
  })
})
