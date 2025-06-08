import express from 'express';
import * as SavedWordController from '../controllers/savedword.controller';
const router = express.Router();

router.get('/:user_uuid', SavedWordController.getSavedWords);
router.post('/save', SavedWordController.saveWord);

export default router; 