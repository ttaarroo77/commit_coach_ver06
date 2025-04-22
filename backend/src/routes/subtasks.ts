import { Router } from 'express';
import { SubtaskService } from '../services/subtaskService';
import { ValidationError, NotFoundError } from '../lib/errors';

const router = Router();

// サブタスク作成
router.post('/', async (req, res, next) => {
  try {
    const { task_id, title, order_index } = req.body;
    if (!task_id || !title) {
      throw new ValidationError('Task ID and title are required');
    }
    const subtask = await SubtaskService.createSubtask({
      task_id,
      title,
      order_index: order_index || 0,
    });
    res.status(201).json(subtask);
  } catch (error) {
    next(error);
  }
});

// サブタスク取得（ID）
router.get('/:id', async (req, res, next) => {
  try {
    const subtask = await SubtaskService.getSubtaskById(req.params.id);
    if (!subtask) {
      throw new NotFoundError('Subtask not found');
    }
    res.json(subtask);
  } catch (error) {
    next(error);
  }
});

// タスクのサブタスク一覧取得
router.get('/task/:taskId', async (req, res, next) => {
  try {
    const subtasks = await SubtaskService.getSubtasksByTaskId(req.params.taskId);
    res.json(subtasks);
  } catch (error) {
    next(error);
  }
});

// サブタスク更新
router.put('/:id', async (req, res, next) => {
  try {
    const { title, order_index } = req.body;
    if (!title) {
      throw new ValidationError('Title is required');
    }
    const subtask = await SubtaskService.updateSubtask(req.params.id, {
      title,
      order_index,
    });
    res.json(subtask);
  } catch (error) {
    next(error);
  }
});

// サブタスク削除
router.delete('/:id', async (req, res, next) => {
  try {
    await SubtaskService.deleteSubtask(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// サブタスク完了状態の切り替え
router.patch('/:id/toggle', async (req, res, next) => {
  try {
    const subtask = await SubtaskService.toggleSubtaskCompletion(req.params.id);
    res.json(subtask);
  } catch (error) {
    next(error);
  }
});

// サブタスク順序更新
router.patch('/task/:taskId/order', async (req, res, next) => {
  try {
    const { subtaskIds } = req.body;
    if (!Array.isArray(subtaskIds)) {
      throw new ValidationError('Subtask IDs must be an array');
    }
    await SubtaskService.updateSubtaskOrder(req.params.taskId, subtaskIds);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router; 