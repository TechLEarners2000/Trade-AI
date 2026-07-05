import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import stockRoutes from './routes/stock.js';
import chatRoutes from './routes/chat.js';
import predictionRoutes from './routes/prediction.js';
const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json());
const limiter = rateLimit({
    windowMs: 60_000,
    max: parseInt(process.env.RATE_LIMIT_PER_MINUTE || '30', 10),
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Rate limit exceeded. Try again in 60 seconds.' },
});
app.use('/api', limiter);
app.use('/api/stock', stockRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/prediction', predictionRoutes);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.listen(PORT, () => {
    console.log(`TradeAI server running on http://localhost:${PORT}`);
});
