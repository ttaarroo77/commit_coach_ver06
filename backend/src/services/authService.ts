import { supabase } from '../lib/supabase';
import { ValidationError, UnauthorizedError } from '../lib/errors';

export class AuthService {
  async signUp(email: string, password: string) {
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedError(error.message);
    }

    return data;
  }

  async signIn(email: string, password: string) {
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedError(error.message);
    }

    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new UnauthorizedError(error.message);
    }
  }

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw new UnauthorizedError(error.message);
    }
    return data;
  }
}