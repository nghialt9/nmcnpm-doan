import express from 'express';
import * as ConversationController from '../controllers/conversation.controller';
const router = express.Router();

router.get('/:history_uuid', ConversationController.getConversations);
router.post('/save', ConversationController.saveConversation);
router.post('/translate', ConversationController.translate);
router.post('/text-to-speech', ConversationController.textToSpeech);

export default router; 