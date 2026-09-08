/**
 * AI Provider Abstraction for Velvorax Marketplace
 * Supports Google Gemini API, OpenAI-compatible APIs (OpenAI, OpenRouter, Groq, etc.),
 * and graceful fallback execution.
 */

export class AIProvider {
  constructor() {
    this.apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '';
    this.provider = (process.env.AI_PROVIDER || 'auto').toLowerCase();
    this.model = process.env.AI_MODEL || '';
    this.baseUrl = process.env.AI_BASE_URL || '';
  }

  /**
   * Determine the active provider based on environment config and API keys
   */
  detectProvider() {
    if (this.provider === 'openai' || this.provider === 'openrouter' || this.provider === 'groq') {
      return this.provider;
    }
    if (this.provider === 'gemini') {
      return 'gemini';
    }
    // Auto-detect based on API key format or available env vars
    if (process.env.GEMINI_API_KEY || (this.apiKey && this.apiKey.startsWith('AIzaSy'))) {
      return 'gemini';
    }
    if (process.env.OPENAI_API_KEY || (this.apiKey && this.apiKey.startsWith('sk-'))) {
      return 'openai';
    }
    if (this.apiKey) {
      return 'gemini'; // Default to Gemini format
    }
    return 'none';
  }

  /**
   * Get default model name according to provider
   */
  getDefaultModel(provider) {
    if (this.model) return this.model;
    switch (provider) {
      case 'gemini':
        return 'gemini-2.5-flash';
      case 'openai':
        return 'gpt-4o-mini';
      case 'openrouter':
        return 'google/gemini-2.5-flash';
      case 'groq':
        return 'llama-3.3-70b-versatile';
      default:
        return 'gemini-2.5-flash';
    }
  }

  /**
   * Generate completion with system instructions and chat messages
   * @param {Object} params
   * @param {string} params.systemPrompt - System instruction
   * @param {Array} params.messages - History [{ role: 'user'|'assistant'|'system', content: string }]
   * @param {number} [params.temperature=0.7] - Temperature
   * @returns {Promise<string>}
   */
  async generateCompletion({ systemPrompt, messages, temperature = 0.7 }) {
    const activeProvider = this.detectProvider();

    if (!this.apiKey || activeProvider === 'none') {
      return null; // Signals caller to use controlled semantic fallback
    }

    try {
      if (activeProvider === 'gemini') {
        return await this.callGeminiApi({ systemPrompt, messages, temperature });
      } else {
        return await this.callOpenAiApi({ systemPrompt, messages, temperature, provider: activeProvider });
      }
    } catch (error) {
      console.error(`AIProvider (${activeProvider}) generation error:`, error.message);
      return null; // Fallback to database synthesis without throwing to client
    }
  }

  /**
   * Google Gemini REST API Implementation
   */
  async callGeminiApi({ systemPrompt, messages, temperature }) {
    const model = this.getDefaultModel('gemini');
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

    const contents = [];
    for (const msg of messages) {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      contents.push({
        role,
        parts: [{ text: msg.content }]
      });
    }

    const payload = {
      contents,
      systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
      generationConfig: {
        temperature,
        maxOutputTokens: 1500,
        topP: 0.95
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        console.warn(`Gemini API returned status ${response.status}:`, errorBody);
        return null;
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text;
      return text || null;
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('Gemini API fetch error (falling back to MongoDB data synthesis):', err.message);
      return null;
    }
  }

  async callOpenAiApi({ systemPrompt, messages, temperature, provider }) {
    const model = this.getDefaultModel(provider);
    let baseUrl = this.baseUrl;

    if (!baseUrl) {
      if (provider === 'openrouter') baseUrl = 'https://openrouter.ai/api/v1';
      else if (provider === 'groq') baseUrl = 'https://api.groq.com/openai/v1';
      else baseUrl = 'https://api.openai.com/v1';
    }

    const endpoint = `${baseUrl}/chat/completions`;

    const openAiMessages = [];
    if (systemPrompt) {
      openAiMessages.push({ role: 'system', content: systemPrompt });
    }

    for (const msg of messages) {
      openAiMessages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: openAiMessages,
          temperature,
          max_tokens: 1500
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        console.warn(`OpenAI-compatible API returned status ${response.status}:`, errorBody);
        return null;
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('OpenAI API fetch error (falling back to MongoDB data synthesis):', err.message);
      return null;
    }
  }
}

export const aiProvider = new AIProvider();
export default aiProvider;
