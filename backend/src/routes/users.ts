import { Router } from 'express';
import { UserService } from '../services/userService';
import { ValidationError, NotFoundError } from '../lib/errors';

const router = Router();

// ユーザー作成
router.post('/', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new ValidationError('Email is required');
    }
    const user = await UserService.createUser({ email });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// ユーザー取得（ID）
router.get('/:id', async (req, res, next) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// ユーザー取得（Email）
router.get('/email/:email', async (req, res, next) => {
  try {
    const user = await UserService.getUserByEmail(req.params.email);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// ユーザー更新
router.put('/:id', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new ValidationError('Email is required');
    }
    const user = await UserService.updateUser(req.params.id, { email });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// ユーザー一覧取得
router.get('/', async (req, res, next) => {
  try {
    const users = await UserService.getUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

export default router; 