import express from 'express';
import * as HistoryController from '../controllers/history.controller';
const router = express.Router();

router.get('/:user_uuid', HistoryController.getHistories);
router.post('/save', HistoryController.saveHistory);

export default router; 