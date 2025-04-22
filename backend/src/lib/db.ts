import { supabase } from './supabase';
import { Database } from '../types/database';

type Tables = Database['public']['Tables'];

export async function insertRecord<T extends keyof Tables>(
  table: T,
  data: Tables[T]['Insert']
) {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function updateRecord<T extends keyof Tables>(
  table: T,
  id: string,
  data: Tables[T]['Update']
) {
  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function deleteRecord<T extends keyof Tables>(
  table: T,
  id: string
) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getRecord<T extends keyof Tables>(
  table: T,
  id: string
) {
  const { data: result, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return result;
}

export async function getRecords<T extends keyof Tables>(
  table: T,
  query?: {
    column?: string;
    value?: any;
    orderBy?: string;
    ascending?: boolean;
    limit?: number;
  }
) {
  let queryBuilder = supabase.from(table).select('*');

  if (query?.column && query?.value) {
    queryBuilder = queryBuilder.eq(query.column, query.value);
  }

  if (query?.orderBy) {
    queryBuilder = queryBuilder.order(query.orderBy, {
      ascending: query.ascending ?? true,
    });
  }

  if (query?.limit) {
    queryBuilder = queryBuilder.limit(query.limit);
  }

  const { data: results, error } = await queryBuilder;

  if (error) throw error;
  return results;
}

export async function getRecordsByUserId<T extends keyof Tables>(
  table: T,
  userId: string,
  query?: {
    orderBy?: string;
    ascending?: boolean;
    limit?: number;
  }
) {
  return getRecords(table, {
    column: 'user_id',
    value: userId,
    ...query,
  });
}

export async function getRecordsByProjectId<T extends keyof Tables>(
  table: T,
  projectId: string,
  query?: {
    orderBy?: string;
    ascending?: boolean;
    limit?: number;
  }
) {
  return getRecords(table, {
    column: 'project_id',
    value: projectId,
    ...query,
  });
}

export async function getRecordsByTaskGroupId<T extends keyof Tables>(
  table: T,
  taskGroupId: string,
  query?: {
    orderBy?: string;
    ascending?: boolean;
    limit?: number;
  }
) {
  return getRecords(table, {
    column: 'task_group_id',
    value: taskGroupId,
    ...query,
  });
}

export async function getRecordsByTaskId<T extends keyof Tables>(
  table: T,
  taskId: string,
  query?: {
    orderBy?: string;
    ascending?: boolean;
    limit?: number;
  }
) {
  return getRecords(table, {
    column: 'task_id',
    value: taskId,
    ...query,
  });
} 