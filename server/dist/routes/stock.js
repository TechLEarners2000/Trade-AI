import { Router } from 'express';
import * as stockApi from '../services/stockApi.js';
const router = Router();
router.get('/search', async (req, res) => {
    try {
        const q = req.query.q;
        if (!q)
            return res.status(400).json({ error: 'Missing query param q' });
        const results = await stockApi.searchStocks(q);
        res.json(results);
    }
    catch (err) {
        res.status(502).json({ error: 'Stock API unavailable', detail: err.message });
    }
});
router.get('/quote', async (req, res) => {
    try {
        const symbol = req.query.symbol;
        if (!symbol)
            return res.status(400).json({ error: 'Missing symbol param' });
        const data = await stockApi.getStock(symbol);
        res.json(data);
    }
    catch (err) {
        res.status(502).json({ error: 'Stock API unavailable', detail: err.message });
    }
});
router.get('/list', async (req, res) => {
    try {
        const symbols = (req.query.symbols || '').split(',').filter(Boolean);
        if (symbols.length === 0)
            return res.status(400).json({ error: 'Missing symbols' });
        const data = await stockApi.getStockList(symbols);
        res.json(data);
    }
    catch (err) {
        res.status(502).json({ error: 'Stock API unavailable', detail: err.message });
    }
});
router.get('/symbols', async (_req, res) => {
    try {
        const symbols = await stockApi.getSymbols();
        res.json(symbols);
    }
    catch (err) {
        res.status(502).json({ error: 'Stock API unavailable', detail: err.message });
    }
});
export default router;
