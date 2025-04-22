import { Router } from 'express';
import { AIMessageService } from '../services/aiMessageService';
import { ValidationError, NotFoundError } from '../lib/errors';

const router = Router();

// AIメッセージ作成
router.post('/', async (req, res, next) => {
  try {
    const { user_id, project_id, role, content } = req.body;
    if (!user_id || !project_id || !role || !content) {
      throw new ValidationError('All fields are required');
    }
    const message = await AIMessageService.createMessage({
      user_id,
      project_id,
      role,
      content,
    });
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
});

// AIメッセージ取得（ID）
router.get('/:id', async (req, res, next) => {
  try {
    const message = await AIMessageService.getMessageById(req.params.id);
    if (!message) {
      throw new NotFoundError('Message not found');
    }
    res.json(message);
  } catch (error) {
    next(error);
  }
});

// ユーザーのAIメッセージ一覧取得
router.get('/user/:userId', async (req, res, next) => {
  try {
    const messages = await AIMessageService.getMessagesByUserId(req.params.userId);
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

// プロジェクトのAIメッセージ一覧取得
router.get('/project/:projectId', async (req, res, next) => {
  try {
    const messages = await AIMessageService.getMessagesByProjectId(req.params.projectId);
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

// 最近のAIメッセージ取得
router.get('/user/:userId/recent', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const messages = await AIMessageService.getRecentMessages(req.params.userId, limit);
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

export default router; 