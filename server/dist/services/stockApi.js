import fetch from 'node-fetch';
import * as cache from './cache.js';
const BASE = process.env.STOCK_API_BASE_URL || 'http://65.0.104.9';
async function apiFetch(endpoint) {
    const url = `${BASE}${endpoint}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
        let msg;
        try {
            const e = await res.json();
            msg = e.message || `HTTP ${res.status}`;
        }
        catch {
            msg = `HTTP ${res.status}`;
        }
        throw new Error(msg);
    }
    return res.json();
}
function transformSingle(raw) {
    const d = raw.data;
    return {
        symbol: raw.symbol,
        price: d.last_price,
        change: d.change,
        changePercent: d.percent_change,
        dayRange: { low: d.day_low, high: d.day_high },
        week52Range: { low: d.year_low, high: d.year_high },
        volume: d.volume,
        marketCap: d.market_cap / 1e12,
        pe: d.pe_ratio,
        dividendYield: d.dividend_yield,
        eps: d.earnings_per_share,
        sector: d.sector,
        industry: d.industry,
        name: d.company_name,
    };
}
function transformListItem(item) {
    return {
        symbol: item.symbol,
        price: item.last_price,
        change: item.change,
        changePercent: item.percent_change,
        dayRange: { low: 0, high: 0 },
        week52Range: { low: 0, high: 0 },
        volume: item.volume,
        marketCap: item.market_cap / 1e12,
        pe: item.pe_ratio,
        dividendYield: 0,
        eps: 0,
        sector: item.sector,
        industry: '',
        name: item.company_name,
    };
}
export async function getStock(symbol) {
    const cacheKey = `stock:${symbol}`;
    const cached = cache.get(cacheKey);
    if (cached)
        return cached;
    const raw = await apiFetch(`/stock?symbol=${encodeURIComponent(symbol)}&res=num`);
    if (raw.status !== 'success' || !raw.data) {
        throw new Error(raw.status === 'error' ? `Stock not found: ${symbol}` : 'Unexpected API response');
    }
    const data = transformSingle(raw);
    cache.set(cacheKey, data);
    return data;
}
export async function searchStocks(query) {
    const cacheKey = `search:${query}`;
    const cached = cache.get(cacheKey);
    if (cached)
        return cached;
    const raw = await apiFetch(`/search?q=${encodeURIComponent(query)}`);
    if (raw.status !== 'success')
        return [];
    const results = (raw.results || []).map(r => ({
        symbol: r.symbol,
        name: r.company_name,
        exchange: 'NSE',
    }));
    cache.set(cacheKey, results, 60_000);
    return results;
}
export async function getStockList(symbols) {
    const results = [];
    const uncached = [];
    for (const sym of symbols) {
        const cached = cache.get(`stock:${sym}`);
        if (cached)
            results.push(cached);
        else
            uncached.push(sym);
    }
    if (uncached.length > 0) {
        const raw = await apiFetch(`/stock/list?symbols=${uncached.join(',')}&res=num`);
        if (raw.status === 'success' && Array.isArray(raw.stocks)) {
            for (const item of raw.stocks) {
                const transformed = transformListItem(item);
                cache.set(`stock:${item.symbol}`, transformed);
                results.push(transformed);
            }
        }
    }
    return results;
}
export async function getSymbols() {
    const cacheKey = 'symbols';
    const cached = cache.get(cacheKey);
    if (cached)
        return cached;
    const raw = await apiFetch('/symbols');
    if (raw.status !== 'success' || !Array.isArray(raw.symbols))
        return [];
    const list = raw.symbols.map(s => ({
        symbol: s.symbol,
        searchTerm: s.search_term,
        nseTicker: s.nse_ticker,
        bseTicker: s.bse_ticker,
    }));
    cache.set(cacheKey, list, 120_000);
    return list;
}
