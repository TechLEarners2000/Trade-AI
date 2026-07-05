import fetch from 'node-fetch';
const API_KEY = process.env.NVIDIA_API_KEY || '';
const MODEL = 'mistralai/mixtral-8x22b-instruct-v0.1';
const BASE_URL = 'https://integrate.api.nvidia.com/v1';
const SYSTEM_PROMPT = `You are TradeAI India, a stock market assistant for NSE/BSE markets.
Rules:
1. ALWAYS call the get_stock_data tool before quoting any price, change, or metric.
2. If data is unavailable, say so — never hallucinate numbers.
3. Always append: "Disclaimer: AI analysis is for educational purposes only. Not financial advice. Consult a SEBI-registered advisor before making decisions."
4. Never give direct buy/sell directives.
5. Explain financial jargon (P/E, EPS, market cap) in simple terms when asked.
6. When comparing stocks, present data in a clear table format.
7. Keep responses concise but informative.`;
export async function chat(messages) {
    if (!API_KEY || API_KEY === 'your_nvidia_api_key_here') {
        return '⚠️ NVIDIA API key not configured. Please set NVIDIA_API_KEY in .env to enable AI chat.';
    }
    const body = {
        model: MODEL,
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages,
        ],
        temperature: 0.3,
        max_tokens: 1024,
        stream: false,
    };
    const res = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`NVIDIA API error ${res.status}: ${err}`);
    }
    const data = (await res.json());
    return data.choices[0].message.content;
}
