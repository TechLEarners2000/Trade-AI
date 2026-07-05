import { Router } from 'express';
import { chat } from '../services/nvidia.js';
import * as stockApi from '../services/stockApi.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body as { messages: Array<{ role: string; content: string }> };
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Missing messages array' });
    }

    const userMsg = messages[messages.length - 1]?.content || '';

    const symbolMatch = userMsg.match(/(RELIANCE|TCS|INFY|HDFCBANK|ITC|SBIN|TATAMOTORS|ADANIPORTS|TATASTEEL|BPCL|COALINDIA|M&M)[.\s]*/i);
    let stockContext = '';

    if (symbolMatch) {
      try {
        const sym = symbolMatch[1].toUpperCase();
        const data = await stockApi.getStock(sym);
        stockContext = `\n\nCurrent data for ${sym}: Price ₹${data.price}, Change ${data.changePercent}%, P/E ${data.pe}, Market Cap ₹${data.marketCap}T, Volume ${data.volume}`;
      } catch {
        stockContext = '\n\n(Stock data temporarily unavailable)';
      }
    }

    const groundedMessages = messages.map(m => ({
      ...m,
      content: m.role === 'user' ? m.content + stockContext : m.content,
    }));

    const reply = await chat(groundedMessages);
    res.json({ reply });
  } catch (err) {
    res.status(502).json({ error: 'Chat service unavailable', detail: (err as Error).message });
  }
});

export default router;
