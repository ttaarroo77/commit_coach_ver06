import { supabase } from '../lib/supabase';
import { UserService } from '../services/userService';
import { ProjectService } from '../services/projectService';
import { TaskService } from '../services/taskService';
import { SubtaskService } from '../services/subtaskService';
import { AIMessageService } from '../services/aiMessageService';

const userService = new UserService();
const projectService = new ProjectService();
const taskService = new TaskService();
const subtaskService = new SubtaskService();
const aiMessageService = new AIMessageService();

export const createTestUser = async (email = 'test@example.com') => {
  const { data: user, error } = await supabase
    .from('users')
    .insert([{ email }])
    .select()
    .single();

  if (error) throw error;
  return user;
};

export const createTestProject = async (userId: string, name = 'Test Project') => {
  const { data: project, error } = await supabase
    .from('projects')
    .insert([{ user_id: userId, name }])
    .select()
    .single();

  if (error) throw error;
  return project;
};

export const createTestTask = async (taskGroupId: string, title = 'Test Task') => {
  const { data: task, error } = await supabase
    .from('tasks')
    .insert([{ task_group_id: taskGroupId, title }])
    .select()
    .single();

  if (error) throw error;
  return task;
};

export const createTestSubtask = async (taskId: string, title = 'Test Subtask') => {
  const { data: subtask, error } = await supabase
    .from('subtasks')
    .insert([{ task_id: taskId, title }])
    .select()
    .single();

  if (error) throw error;
  return subtask;
};

export const createTestAIMessage = async (userId: string, projectId: string, content = 'Test Message') => {
  const { data: message, error } = await supabase
    .from('ai_messages')
    .insert([{ user_id: userId, project_id: projectId, role: 'user', content }])
    .select()
    .single();

  if (error) throw error;
  return message;
};

export const cleanupTestData = async () => {
  const { error: messagesError } = await supabase.from('ai_messages').delete().neq('id', '');
  if (messagesError) throw messagesError;

  const { error: subtasksError } = await supabase.from('subtasks').delete().neq('id', '');
  if (subtasksError) throw subtasksError;

  const { error: tasksError } = await supabase.from('tasks').delete().neq('id', '');
  if (tasksError) throw tasksError;

  const { error: projectsError } = await supabase.from('projects').delete().neq('id', '');
  if (projectsError) throw projectsError;

  const { error: usersError } = await supabase.from('users').delete().neq('id', '');
  if (usersError) throw usersError;
}; 