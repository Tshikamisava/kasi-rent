import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { listConversations, createConversation, getMessages, markRead, editMessage, deleteMessage } from '../controllers/chatController.js';

const router = express.Router();

router.use(protect);

router.get('/', listConversations);
router.post('/', createConversation);
router.get('/:id/messages', getMessages);
router.post('/:id/read', markRead);

// Message edit and delete routes
const messageRouter = express.Router();
messageRouter.use(protect);
messageRouter.put('/:messageId', editMessage);
messageRouter.delete('/:messageId', deleteMessage);

export default router;
export { messageRouter };