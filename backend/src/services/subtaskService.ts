import { supabase } from '../lib/supabase';
import { ValidationError, NotFoundError } from '../lib/errors';

export class SubtaskService {
  async createSubtask(data: { task_id: string; title: string }): Promise<any> {
    if (!data.task_id || !data.title) {
      throw new ValidationError('Task ID and title are required');
    }

    const { data: subtask, error } = await supabase
      .from('subtasks')
      .insert([{ ...data, is_completed: false }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return subtask;
  }

  async getSubtaskById(id: string): Promise<any> {
    const { data: subtask, error } = await supabase
      .from('subtasks')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!subtask) {
      throw new NotFoundError('Subtask not found');
    }

    return subtask;
  }

  async getSubtasksByTaskId(taskId: string): Promise<any[]> {
    const { data: subtasks, error } = await supabase
      .from('subtasks')
      .select()
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return subtasks || [];
  }

  async updateSubtask(id: string, data: { title?: string }): Promise<any> {
    if (data.title === '') {
      throw new ValidationError('Title cannot be empty');
    }

    const { data: subtask, error } = await supabase
      .from('subtasks')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!subtask) {
      throw new NotFoundError('Subtask not found');
    }

    return subtask;
  }

  async deleteSubtask(id: string): Promise<void> {
    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  async toggleSubtaskCompletion(id: string): Promise<any> {
    const subtask = await this.getSubtaskById(id);
    const { data: updatedSubtask, error } = await supabase
      .from('subtasks')
      .update({ is_completed: !subtask.is_completed })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return updatedSubtask;
  }

  async updateSubtaskOrder(taskId: string, subtaskIds: string[]): Promise<void> {
    if (!Array.isArray(subtaskIds)) {
      throw new ValidationError('Subtask IDs must be an array');
    }

    const { error } = await supabase
      .from('subtasks')
      .update({ order: subtaskIds.indexOf(taskId) })
      .in('id', subtaskIds);

    if (error) {
      throw new Error(error.message);
    }
  }
}