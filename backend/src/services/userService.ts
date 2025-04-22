import { supabase } from '../lib/supabase';
import { ValidationError, NotFoundError } from '../lib/errors';

export class UserService {
  async createUser(data: { email: string }): Promise<any> {
    if (!data.email) {
      throw new ValidationError('Email is required');
    }

    const { data: user, error } = await supabase
      .from('users')
      .insert([data])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return user;
  }

  async getUserById(id: string): Promise<any> {
    const { data: user, error } = await supabase
      .from('users')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<any> {
    const { data: user, error } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async updateUser(id: string, data: { email: string }): Promise<any> {
    if (!data.email) {
      throw new ValidationError('Email is required');
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  async getAllUsers(): Promise<any[]> {
    const { data: users, error } = await supabase
      .from('users')
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return users || [];
  }
} 