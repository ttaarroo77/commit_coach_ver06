import { Router } from 'express';
import { AuthService } from '../services/authService';

const router = Router();
const authService = new AuthService();

router.post('/signup', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await authService.signUp(email, password);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await authService.signIn(email, password);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    await authService.signOut();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get('/session', async (req, res, next) => {
  try {
    const data = await authService.getSession();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router; 