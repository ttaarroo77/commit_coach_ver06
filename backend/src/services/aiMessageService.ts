import { getRecord, getRecords, insertRecord } from '../lib/db';
import { Database } from '../types/database';

type AIMessage = Database['public']['Tables']['ai_messages']['Row'];
type AIMessageInsert = Database['public']['Tables']['ai_messages']['Insert'];

export class AIMessageService {
  static async createMessage(data: AIMessageInsert): Promise<AIMessage> {
    return insertRecord('ai_messages', data);
  }

  static async getMessageById(id: string): Promise<AIMessage> {
    return getRecord('ai_messages', id);
  }

  static async getMessagesByUserId(userId: string): Promise<AIMessage[]> {
    return getRecords('ai_messages', {
      column: 'user_id',
      value: userId,
      orderBy: 'created_at',
      ascending: false,
    });
  }

  static async getMessagesByProjectId(projectId: string): Promise<AIMessage[]> {
    return getRecords('ai_messages', {
      column: 'project_id',
      value: projectId,
      orderBy: 'created_at',
      ascending: false,
    });
  }

  static async getRecentMessages(userId: string, limit: number = 10): Promise<AIMessage[]> {
    return getRecords('ai_messages', {
      column: 'user_id',
      value: userId,
      orderBy: 'created_at',
      ascending: false,
      limit,
    });
  }
} 