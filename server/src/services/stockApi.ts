import fetch from 'node-fetch';
import * as cache from './cache.js';

const BASE = process.env.STOCK_API_BASE_URL || 'http://65.0.104.9';

interface RawSingleData {
  last_price: number;
  change: number;
  percent_change: number;
  previous_close: number;
  open: number;
  day_high: number;
  day_low: number;
  year_high: number;
  year_low: number;
  volume: number;
  market_cap: number;
  pe_ratio: number;
  dividend_yield: number;
  book_value: number;
  earnings_per_share: number;
  sector: string;
  industry: string;
  company_name: string;
  currency: string;
  last_update: string;
  timestamp: string;
}

interface RawSingleResponse {
  status: string;
  symbol: string;
  exchange: string;
  ticker: string;
  response_format: string;
  data: RawSingleData;
  alternate_exchange: Record<string, unknown>;
}

interface RawListItem {
  symbol: string;
  exchange: string;
  ticker: string;
  company_name: string;
  last_price: number;
  change: number;
  percent_change: number;
  volume: number;
  market_cap: number;
  pe_ratio: number;
  sector: string;
}

interface RawListResponse {
  status: string;
  response_format: string;
  count: number;
  stocks: RawListItem[];
  timestamp: string;
}

interface RawSearchResult {
  symbol: string;
  company_name: string;
  match_type: string;
  source: string;
  api_url: string;
  nse_url: string;
  bse_url: string;
}

interface RawSearchResponse {
  status: string;
  query: string;
  total_results: number;
  results: RawSearchResult[];
  note: string;
  timestamp: string;
}

interface RawSymbolEntry {
  search_term: string;
  symbol: string;
  nse_ticker: string;
  bse_ticker: string;
  api_url_nse: string;
  api_url_bse: string;
}

interface RawSymbolsResponse {
  status: string;
  total_symbols: number;
  symbols: RawSymbolEntry[];
  note: string;
}

export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  dayRange: { low: number; high: number };
  week52Range: { low: number; high: number };
  volume: number;
  marketCap: number;
  pe: number;
  dividendYield: number;
  eps: number;
  sector: string;
  industry: string;
  name: string;
}

export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
}

export interface SymbolInfo {
  symbol: string;
  searchTerm: string;
  nseTicker: string;
  bseTicker: string;
}

async function apiFetch<T>(endpoint: string): Promise<T> {
  const url = `${BASE}${endpoint}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) {
    let msg: string;
    try { const e = await res.json() as { message?: string }; msg = e.message || `HTTP ${res.status}`; }
    catch { msg = `HTTP ${res.status}`; }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

function transformSingle(raw: RawSingleResponse): StockData {
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

function transformListItem(item: RawListItem): StockData {
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

export async function getStock(symbol: string): Promise<StockData> {
  const cacheKey = `stock:${symbol}`;
  const cached = cache.get<StockData>(cacheKey);
  if (cached) return cached;

  const raw = await apiFetch<RawSingleResponse>(`/stock?symbol=${encodeURIComponent(symbol)}&res=num`);
  if (raw.status !== 'success' || !raw.data) {
    throw new Error(raw.status === 'error' ? `Stock not found: ${symbol}` : 'Unexpected API response');
  }
  const data = transformSingle(raw);
  cache.set(cacheKey, data);
  return data;
}

export async function searchStocks(query: string): Promise<SearchResult[]> {
  const cacheKey = `search:${query}`;
  const cached = cache.get<SearchResult[]>(cacheKey);
  if (cached) return cached;

  const raw = await apiFetch<RawSearchResponse>(`/search?q=${encodeURIComponent(query)}`);
  if (raw.status !== 'success') return [];
  const results = (raw.results || []).map(r => ({
    symbol: r.symbol,
    name: r.company_name,
    exchange: 'NSE',
  }));
  cache.set(cacheKey, results, 60_000);
  return results;
}

export async function getStockList(symbols: string[]): Promise<StockData[]> {
  const results: StockData[] = [];
  const uncached: string[] = [];

  for (const sym of symbols) {
    const cached = cache.get<StockData>(`stock:${sym}`);
    if (cached) results.push(cached);
    else uncached.push(sym);
  }

  if (uncached.length > 0) {
    const raw = await apiFetch<RawListResponse>(`/stock/list?symbols=${uncached.join(',')}&res=num`);
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

export async function getSymbols(): Promise<SymbolInfo[]> {
  const cacheKey = 'symbols';
  const cached = cache.get<SymbolInfo[]>(cacheKey);
  if (cached) return cached;

  const raw = await apiFetch<RawSymbolsResponse>('/symbols');
  if (raw.status !== 'success' || !Array.isArray(raw.symbols)) return [];
  const list = raw.symbols.map(s => ({
    symbol: s.symbol,
    searchTerm: s.search_term,
    nseTicker: s.nse_ticker,
    bseTicker: s.bse_ticker,
  }));
  cache.set(cacheKey, list, 120_000);
  return list;
}
