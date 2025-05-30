import type { Meta, StoryObj } from '@storybook/react'
import { EditableHierarchicalTaskItem } from '../components/dashboard/EditableHierarchicalTaskItem'

const meta: Meta<typeof EditableHierarchicalTaskItem> = {
  title: 'Components/EditableHierarchicalTaskItem',
  component: EditableHierarchicalTaskItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof EditableHierarchicalTaskItem>

export const Default: Story = {
  args: {
    id: '1',
    title: 'Sample Task',
    level: 1,
  },
}

export const WithChildren: Story = {
  args: {
    id: '2',
    title: 'Parent Task',
    level: 1,
    hasChildren: true,
    expanded: true,
  },
}

export const Completed: Story = {
  args: {
    id: '3',
    title: 'Completed Task',
    level: 1,
    completed: true,
  },
}

export const WithTime: Story = {
  args: {
    id: '4',
    title: 'Task with Time',
    level: 1,
    startTime: '09:00',
    endTime: '10:00',
  },
}

export const SubTask: Story = {
  args: {
    id: '5',
    title: 'Sub Task',
    level: 2,
  },
}

export const SubSubTask: Story = {
  args: {
    id: '6',
    title: 'Sub Sub Task',
    level: 3,
  },
}
