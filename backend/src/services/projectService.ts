import { supabase } from '../lib/supabase';
import { ValidationError, NotFoundError } from '../lib/errors';

export class ProjectService {
  async createProject(data: { user_id: string; title: string }): Promise<any> {
    if (!data.user_id || !data.title) {
      throw new ValidationError('User ID and title are required');
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert([{ ...data, is_active: true }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return project;
  }

  async getProjectById(id: string): Promise<any> {
    const { data: project, error } = await supabase
      .from('projects')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    return project;
  }

  async getProjectsByUserId(userId: string): Promise<any[]> {
    const { data: projects, error } = await supabase
      .from('projects')
      .select()
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    return projects || [];
  }

  async updateProject(id: string, data: { title?: string; is_active?: boolean }): Promise<any> {
    if (data.title === '') {
      throw new ValidationError('Title cannot be empty');
    }

    const { data: project, error } = await supabase
      .from('projects')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    return project;
  }

  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  async getActiveProjectsByUserId(userId: string): Promise<any[]> {
    const { data: projects, error } = await supabase
      .from('projects')
      .select()
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      throw new Error(error.message);
    }

    return projects || [];
  }
} 