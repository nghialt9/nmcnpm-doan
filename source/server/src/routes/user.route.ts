import express from 'express';
import * as UserController from '../controllers/user.controller';
const router = express.Router();

router.get('/:uuid', UserController.getUser);
router.post('/login', UserController.login);
router.post('/register', UserController.register);

export default router; 