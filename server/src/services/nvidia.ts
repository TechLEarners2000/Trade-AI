import fetch from 'node-fetch';

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '';
const OPEN_ROUTER_KEY = process.env.OPEN_ROUTER_API_KEY || '';
const MODEL = 'mistralai/mixtral-8x22b-instruct-v0.1';

interface ChatMessage {
  role: string;
  content: string;
}

interface ApiChoice {
  message: { content: string };
  finish_reason: string;
}

interface ApiResponse {
  choices: ApiChoice[];
}

const SYSTEM_PROMPT = `You are TradeAI India, a stock market assistant for NSE/BSE markets.
Rules:
1. ALWAYS call the get_stock_data tool before quoting any price, change, or metric.
2. If data is unavailable, say so — never hallucinate numbers.
3. Always append: "Disclaimer: AI analysis is for educational purposes only. Not financial advice. Consult a SEBI-registered advisor before making decisions."
4. Never give direct buy/sell directives.
5. Explain financial jargon (P/E, EPS, market cap) in simple terms when asked.
6. When comparing stocks, present data in a clear table format.
7. Keep responses concise but informative.`;

function buildBody(messages: ChatMessage[]) {
  return {
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ],
    temperature: 0.3,
    max_tokens: 1024,
    stream: false,
  };
}

async function callNvidia(messages: ChatMessage[]): Promise<string> {
  if (!NVIDIA_API_KEY || NVIDIA_API_KEY === 'your_nvidia_api_key_here') {
    throw new Error('NVIDIA API key not configured');
  }

  const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${NVIDIA_API_KEY}`,
    },
    body: JSON.stringify(buildBody(messages)),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`NVIDIA API error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as ApiResponse;
  return data.choices[0].message.content;
}

async function callOpenRouter(messages: ChatMessage[]): Promise<string> {
  if (!OPEN_ROUTER_KEY) {
    throw new Error('OpenRouter API key not configured');
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPEN_ROUTER_KEY}`,
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'TradeAI India',
    },
    body: JSON.stringify(buildBody(messages)),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter API error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as ApiResponse;
  return data.choices[0].message.content;
}

export async function chat(messages: ChatMessage[]): Promise<string> {
  if (!NVIDIA_API_KEY || NVIDIA_API_KEY === 'your_nvidia_api_key_here') {
    if (!OPEN_ROUTER_KEY) {
      return '⚠️ No AI API key configured. Set NVIDIA_API_KEY or OPEN_ROUTER_API_KEY in .env to enable AI chat.';
    }
    return callOpenRouter(messages);
  }

  try {
    return await callNvidia(messages);
  } catch {
    if (!OPEN_ROUTER_KEY) {
      throw new Error('NVIDIA API failed and no fallback key configured');
    }
    return callOpenRouter(messages);
  }
}
