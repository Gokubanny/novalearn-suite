import { Router } from 'express';
import {
  listDiscussions, createDiscussion, replyDiscussion, togglePin, deleteDiscussion,
} from './discussion.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();
router.use(protect);

router.get('/courses/:courseId', listDiscussions);
router.post('/courses/:courseId', createDiscussion);
router.post('/:id/replies', replyDiscussion);
router.patch('/:id/pin', togglePin);
router.delete('/:id', deleteDiscussion);

export default router;
