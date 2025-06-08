import express from 'express';
import cors from 'cors';
import userRouter from './routes/user.route';
import historyRouter from './routes/history.route';
import conversationRouter from './routes/conversation.route';
import savedwordRouter from './routes/savedword.route';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/user', userRouter);
app.use('/api/history', historyRouter);
app.use('/api/conversation', conversationRouter);
app.use('/api/words', savedwordRouter);

export default app; 