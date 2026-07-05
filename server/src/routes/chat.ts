import { Router } from 'express';
import { chat } from '../services/nvidia.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body as { messages: Array<{ role: string; content: string }> };
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Missing messages array' });
    }

    const reply = await chat(messages);
    res.json({ reply });
  } catch (err) {
    res.status(502).json({ error: 'Chat service unavailable', detail: (err as Error).message });
  }
});

export default router;
