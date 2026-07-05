import fetch from 'node-fetch';
import * as cache from './cache.js';
import { getYahooQuote, getYahooBatchQuotes } from './yahooFinance.js';
const BASE = process.env.STOCK_API_BASE_URL || 'http://65.0.104.9';
const STATIC_SYMBOLS = [
    { symbol: 'RELIANCE', searchTerm: 'reliance', nseTicker: 'RELIANCE.NS', bseTicker: 'RELIANCE.BO' },
    { symbol: 'TCS', searchTerm: 'tcs', nseTicker: 'TCS.NS', bseTicker: 'TCS.BO' },
    { symbol: 'HDFCBANK', searchTerm: 'hdfc bank', nseTicker: 'HDFCBANK.NS', bseTicker: 'HDFCBANK.BO' },
    { symbol: 'INFY', searchTerm: 'infosys', nseTicker: 'INFY.NS', bseTicker: 'INFY.BO' },
    { symbol: 'ICICIBANK', searchTerm: 'icici bank', nseTicker: 'ICICIBANK.NS', bseTicker: 'ICICIBANK.BO' },
    { symbol: 'BHARTIARTL', searchTerm: 'bharti airtel', nseTicker: 'BHARTIARTL.NS', bseTicker: 'BHARTIARTL.BO' },
    { symbol: 'SBIN', searchTerm: 'state bank of india', nseTicker: 'SBIN.NS', bseTicker: 'SBIN.BO' },
    { symbol: 'ITC', searchTerm: 'itc', nseTicker: 'ITC.NS', bseTicker: 'ITC.BO' },
    { symbol: 'HINDUNILVR', searchTerm: 'hindustan unilever', nseTicker: 'HINDUNILVR.NS', bseTicker: 'HINDUNILVR.BO' },
    { symbol: 'IOC', searchTerm: 'indian oil', nseTicker: 'IOC.NS', bseTicker: 'IOC.BO' },
    { symbol: 'LT', searchTerm: 'larsen & toubro', nseTicker: 'LT.NS', bseTicker: 'LT.BO' },
    { symbol: 'ASIANPAINT', searchTerm: 'asian paints', nseTicker: 'ASIANPAINT.NS', bseTicker: 'ASIANPAINT.BO' },
    { symbol: 'MARUTI', searchTerm: 'maruti suzuki', nseTicker: 'MARUTI.NS', bseTicker: 'MARUTI.BO' },
    { symbol: 'BAJFINANCE', searchTerm: 'bajaj finance', nseTicker: 'BAJFINANCE.NS', bseTicker: 'BAJFINANCE.BO' },
    { symbol: 'TITAN', searchTerm: 'titan', nseTicker: 'TITAN.NS', bseTicker: 'TITAN.BO' },
    { symbol: 'TATAMOTORS', searchTerm: 'tata motors', nseTicker: 'TATAMOTORS.NS', bseTicker: 'TATAMOTORS.BO' },
    { symbol: 'ADANIPORTS', searchTerm: 'adani ports', nseTicker: 'ADANIPORTS.NS', bseTicker: 'ADANIPORTS.BO' },
    { symbol: 'NTPC', searchTerm: 'ntpc', nseTicker: 'NTPC.NS', bseTicker: 'NTPC.BO' },
    { symbol: 'KOTAKBANK', searchTerm: 'kotak mahindra', nseTicker: 'KOTAKBANK.NS', bseTicker: 'KOTAKBANK.BO' },
    { symbol: 'M&M', searchTerm: 'mahindra & mahindra', nseTicker: 'M&M.NS', bseTicker: 'M&M.BO' },
    { symbol: 'WIPRO', searchTerm: 'wipro', nseTicker: 'WIPRO.NS', bseTicker: 'WIPRO.BO' },
    { symbol: 'HCLTECH', searchTerm: 'hcl technologies', nseTicker: 'HCLTECH.NS', bseTicker: 'HCLTECH.BO' },
    { symbol: 'SUNPHARMA', searchTerm: 'sun pharma', nseTicker: 'SUNPHARMA.NS', bseTicker: 'SUNPHARMA.BO' },
    { symbol: 'AXISBANK', searchTerm: 'axis bank', nseTicker: 'AXISBANK.NS', bseTicker: 'AXISBANK.BO' },
    { symbol: 'POWERGRID', searchTerm: 'power grid', nseTicker: 'POWERGRID.NS', bseTicker: 'POWERGRID.BO' },
    { symbol: 'TATASTEEL', searchTerm: 'tata steel', nseTicker: 'TATASTEEL.NS', bseTicker: 'TATASTEEL.BO' },
    { symbol: 'ULTRACEMCO', searchTerm: 'ultratech cement', nseTicker: 'ULTRACEMCO.NS', bseTicker: 'ULTRACEMCO.BO' },
    { symbol: 'NESTLEIND', searchTerm: 'nestle india', nseTicker: 'NESTLEIND.NS', bseTicker: 'NESTLEIND.BO' },
    { symbol: 'HINDALCO', searchTerm: 'hindalco', nseTicker: 'HINDALCO.NS', bseTicker: 'HINDALCO.BO' },
    { symbol: 'ONGC', searchTerm: 'ongc', nseTicker: 'ONGC.NS', bseTicker: 'ONGC.BO' },
    { symbol: 'COALINDIA', searchTerm: 'coal india', nseTicker: 'COALINDIA.NS', bseTicker: 'COALINDIA.BO' },
    { symbol: 'BPCL', searchTerm: 'bpcl', nseTicker: 'BPCL.NS', bseTicker: 'BPCL.BO' },
    { symbol: 'ADANIENT', searchTerm: 'adani enterprises', nseTicker: 'ADANIENT.NS', bseTicker: 'ADANIENT.BO' },
];
async function apiFetch(endpoint, timeoutMs = 5000) {
    const url = `${BASE}${endpoint}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
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
    try {
        const raw = await apiFetch(`/stock?symbol=${encodeURIComponent(symbol)}&res=num`);
        if (raw.status !== 'success' || !raw.data) {
            throw new Error('Non-success response');
        }
        const data = transformSingle(raw);
        cache.set(cacheKey, data);
        return data;
    }
    catch {
        const data = await getYahooQuote(symbol);
        cache.set(cacheKey, data);
        return data;
    }
}
export async function searchStocks(query) {
    const cacheKey = `search:${query}`;
    const cached = cache.get(cacheKey);
    if (cached)
        return cached;
    try {
        const raw = await apiFetch(`/search?q=${encodeURIComponent(query)}`);
        if (raw.status !== 'success')
            throw new Error('Non-success');
        const results = (raw.results || []).map(r => ({
            symbol: r.symbol,
            name: r.company_name,
            exchange: 'NSE',
        }));
        cache.set(cacheKey, results, 60_000);
        return results;
    }
    catch {
        const q = query.toLowerCase();
        const results = STATIC_SYMBOLS
            .filter(s => s.symbol.toLowerCase().includes(q) || s.searchTerm.includes(q))
            .map(s => ({ symbol: s.symbol, name: s.searchTerm, exchange: 'NSE' }));
        cache.set(cacheKey, results, 60_000);
        return results;
    }
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
        try {
            const raw = await apiFetch(`/stock/list?symbols=${uncached.join(',')}&res=num`);
            if (raw.status === 'success' && Array.isArray(raw.stocks)) {
                for (const item of raw.stocks) {
                    const transformed = transformListItem(item);
                    cache.set(`stock:${item.symbol}`, transformed);
                    results.push(transformed);
                }
            }
            else {
                throw new Error('Non-success');
            }
        }
        catch {
            const yahooResults = await getYahooBatchQuotes(uncached);
            for (const item of yahooResults) {
                cache.set(`stock:${item.symbol}`, item);
                results.push(item);
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
    try {
        const raw = await apiFetch('/symbols');
        if (raw.status !== 'success' || !Array.isArray(raw.symbols))
            throw new Error('Non-success');
        const list = raw.symbols.map(s => ({
            symbol: s.symbol,
            searchTerm: s.search_term,
            nseTicker: s.nse_ticker,
            bseTicker: s.bse_ticker,
        }));
        cache.set(cacheKey, list, 120_000);
        return list;
    }
    catch {
        cache.set(cacheKey, STATIC_SYMBOLS, 120_000);
        return STATIC_SYMBOLS;
    }
}
