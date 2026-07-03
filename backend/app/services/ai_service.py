from typing import Optional, List, Dict
import json
import os


class AIService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY") or os.getenv("GEMINI_API_KEY")
        self.provider = "openai" if os.getenv("OPENAI_API_KEY") else "gemini" if os.getenv("GEMINI_API_KEY") else None

    async def generate_response(self, prompt: str, context: Optional[Dict] = None) -> str:
        if not self.provider:
            return self._fallback_response(prompt, context)
        try:
            return await self._call_ai_api(prompt, context)
        except Exception:
            return self._fallback_response(prompt, context)

    async def _call_ai_api(self, prompt: str, context: Optional[Dict] = None) -> str:
        if self.provider == "openai":
            return await self._call_openai(prompt, context)
        else:
            return await self._call_gemini(prompt, context)

    async def _call_openai(self, prompt: str, context: Optional[Dict] = None) -> str:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=self.api_key)
            messages = [{"role": "system", "content": self._system_prompt()}]
            if context:
                messages.append({"role": "user", "content": f"Context: {json.dumps(context)}\n\n{prompt}"})
            else:
                messages.append({"role": "user", "content": prompt})
            response = await client.chat.completions.create(
                model="gpt-4o-mini", messages=messages, max_tokens=1024
            )
            return response.choices[0].message.content
        except Exception:
            raise

    async def _call_gemini(self, prompt: str, context: Optional[Dict] = None) -> str:
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            full_prompt = f"{self._system_prompt()}\n\n"
            if context:
                full_prompt += f"Context: {json.dumps(context)}\n\n"
            full_prompt += prompt
            response = await model.generate_content_async(full_prompt)
            return response.text
        except Exception:
            raise

    def _system_prompt(self) -> str:
        return """You are TradeAI, an expert Indian stock market analyst assistant.
You provide accurate, data-driven insights about Indian stocks, markets, and trading.
Use simple language for beginners and detailed analysis for experts.
Always include disclaimers that this is not financial advice.
Focus on NSE/BSE listed stocks. Use Indian market terminology."""

    def _fallback_response(self, prompt: str, context: Optional[Dict] = None) -> str:
        prompt_lower = prompt.lower()

        if "explain" in prompt_lower and ("stock" in prompt_lower or "company" in prompt_lower):
            return self._explain_stock_fallback(context)
        if "summarize" in prompt_lower and "quarterly" in prompt_lower:
            return self._summarize_quarterly_fallback(context)
        if "technical" in prompt_lower or "indicator" in prompt_lower:
            return self._explain_technical_fallback()
        if "swing" in prompt_lower or "trade" in prompt_lower:
            return self._swing_trade_fallback()
        if "risk" in prompt_lower:
            return self._risk_fallback()
        return self._general_fallback()

    def _explain_stock_fallback(self, context: Optional[Dict] = None) -> str:
        if context and context.get("company_name"):
            return (
                f"**{context['company_name']}** is a company in the {context.get('sector', 'N/A')} sector. "
                f"Its current PE is {context.get('pe_ratio', 'N/A')} and ROE is {context.get('roe', 'N/A')}%. "
                f"The stock is trading at ₹{context.get('current_price', 'N/A')} with a market cap of {context.get('market_cap', 'N/A')} Cr. "
                f"Promoter holding is {context.get('promoter_holding', 'N/A')}% and FII holding is {context.get('fii_holding', 'N/A')}%."
                "\n\n*This is for educational purposes only. Not investment advice.*"
            )
        return "This stock shows reasonable fundamentals. Please check the stock page for detailed metrics. Not investment advice."

    def _summarize_quarterly_fallback(self, context: Optional[Dict] = None) -> str:
        return (
            "The quarterly results show the company's recent financial performance. "
            "Key metrics to look at include revenue growth, profit margins, and EPS trend. "
            "Compare with previous quarters to identify growth trajectory. "
            "\n\n*This is for educational purposes only. Not investment advice.*"
        )

    def _explain_technical_fallback(self) -> str:
        return (
            "Technical indicators help analyze price trends and momentum:\n"
            "- **RSI (Relative Strength Index)**: Measures overbought (>70) and oversold (<30) conditions\n"
            "- **MACD**: Shows trend direction and momentum changes\n"
            "- **Moving Averages**: Identify trend support/resistance levels\n"
            "- **Bollinger Bands**: Measure volatility and potential reversals\n"
            "- **Volume**: Confirms price movements\n\n"
            "*Always combine multiple indicators before making decisions. Not investment advice.*"
        )

    def _swing_trade_fallback(self) -> str:
        return (
            "For swing trading ideas, look for:\n"
            "1. Stocks with strong volume breakout from consolidation\n"
            "2. RSI between 40-60 with upward momentum\n"
            "3. Stock price above key moving averages (20, 50 EMA)\n"
            "4. Positive sector and market trend\n\n"
            "*These are educational suggestions. Do your own research. Not investment advice.*"
        )

    def _risk_fallback(self) -> str:
        return (
            "Risk assessment considers:\n"
            "- **Volatility**: Higher beta stocks carry more risk\n"
            "- **Debt Levels**: High debt-to-equity increases financial risk\n"
            "- **Promoter Pledging**: High pledging is a red flag\n"
            "- **Trading Volume**: Low liquidity increases execution risk\n"
            "- **Sector Concentration**: Lack of diversification\n\n"
            "*This is a general risk framework. Consult a financial advisor for personalized advice.*"
        )

    def _general_fallback(self) -> str:
        return (
            "Thank you for your query about the Indian stock market. "
            "I can help you with:\n"
            "- Stock analysis and fundamental data\n"
            "- Technical indicators and chart patterns\n"
            "- Market news and corporate actions\n"
            "- Investment strategies and risk management\n"
            "- Portfolio analysis and diversification\n\n"
            "Please feel free to ask a more specific question!\n\n"
            "*This is for educational purposes only. Not investment advice.*"
        )
