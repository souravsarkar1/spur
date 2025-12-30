import { Router } from 'express';
import { handleMessage, getHistory, getSessions, deleteAllSessions } from '../controllers/chatController';

const router = Router();

router.post('/message', handleMessage);
router.get('/history/:sessionId', getHistory);
router.get('/sessions', getSessions);
router.delete('/sessions', deleteAllSessions);

export default router;
