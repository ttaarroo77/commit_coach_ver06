import { supabase } from '../lib/supabase';
import { ValidationError, NotFoundError } from '../lib/errors';

export class TaskService {
  async createTask(data: { task_group_id: string; title: string }): Promise<any> {
    if (!data.task_group_id || !data.title) {
      throw new ValidationError('Task group ID and title are required');
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert([{ ...data, status: 'todo' }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return task;
  }

  async getTaskById(id: string): Promise<any> {
    const { data: task, error } = await supabase
      .from('tasks')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return task;
  }

  async getTasksByGroupId(taskGroupId: string): Promise<any[]> {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select()
      .eq('task_group_id', taskGroupId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return tasks || [];
  }

  async updateTask(id: string, data: { title?: string }): Promise<any> {
    if (data.title === '') {
      throw new ValidationError('Title cannot be empty');
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return task;
  }

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  async updateTaskStatus(id: string, status: 'todo' | 'in_progress' | 'done'): Promise<any> {
    const { data: task, error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return task;
  }

  async updateTaskOrder(taskGroupId: string, taskIds: string[]): Promise<void> {
    if (!Array.isArray(taskIds)) {
      throw new ValidationError('Task IDs must be an array');
    }

    const { error } = await supabase
      .from('tasks')
      .update({ order: taskIds.indexOf(taskGroupId) })
      .in('id', taskIds);

    if (error) {
      throw new Error(error.message);
    }
  }
} 