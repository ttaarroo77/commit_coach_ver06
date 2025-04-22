import { Router } from 'express';
import { TaskService } from '../services/taskService';
import { ValidationError, NotFoundError } from '../lib/errors';

const router = Router();
const taskService = new TaskService();

// タスク作成
router.post('/', async (req, res, next) => {
  try {
    const { task_group_id, title } = req.body;
    if (!task_group_id || !title) {
      throw new ValidationError('Task group ID and title are required');
    }
    const task = await taskService.createTask({ task_group_id, title });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

// タスク取得（ID）
router.get('/:id', async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    if (!task) {
      throw new NotFoundError('Task not found');
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
});

// タスクグループのタスク一覧取得
router.get('/group/:taskGroupId', async (req, res, next) => {
  try {
    const tasks = await taskService.getTasksByGroupId(req.params.taskGroupId);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// タスク更新
router.put('/:id', async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title) {
      throw new ValidationError('Title is required');
    }
    const task = await taskService.updateTask(req.params.id, { title });
    res.json(task);
  } catch (error) {
    next(error);
  }
});

// タスク削除
router.delete('/:id', async (req, res, next) => {
  try {
    await taskService.deleteTask(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// タスクステータス更新
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      throw new ValidationError('Status is required');
    }
    const task = await taskService.updateTaskStatus(req.params.id, status);
    res.json(task);
  } catch (error) {
    next(error);
  }
});

// タスク順序更新
router.patch('/group/:taskGroupId/order', async (req, res, next) => {
  try {
    const { taskIds } = req.body;
    if (!Array.isArray(taskIds)) {
      throw new ValidationError('Task IDs must be an array');
    }
    await taskService.updateTaskOrder(req.params.taskGroupId, taskIds);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

const { data, error } = await supabase
  .from('tasks')
  .insert([
    {
      title,
      project_id,
      description,
      status: 'pending'
    }
  ])
  .select()
  .single();

if (error) throw error;

res.json({
  message: '新規タスクを作成しました',
  data: {
    ...data,
    subtasks: []
  }
});
  } catch (error) {
  next(error);
}
});

export default router; 