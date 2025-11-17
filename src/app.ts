import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes';
import { globalRateLimiter } from './middlewares/rateLimiter';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(globalRateLimiter);
app.use('/auth', authRoutes);

app.get('/', (req, res) => res.json({ message: 'Auth Service Running' }));

export default app;
