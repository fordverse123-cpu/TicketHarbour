import dotenv from 'dotenv';
import { SYSTEM_PROMPT } from './aiPrompts.js';

dotenv.config();

/**
 * Helper to call Google Gemini REST API or OpenAI REST API or structured deterministic parser
 */
export const callAIProvider = async ({ messages, systemPrompt = SYSTEM_PROMPT, maxTokens = 500 }) => {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
  const apiKey = process.env.AI_API_KEY;
  const modelName = process.env.AI_MODEL || (provider === 'openai' ? 'gpt-4o-mini' : 'gemini-1.5-flash');

  // If key is missing or explicitly set to 'none', return fallback signal
  if (!apiKey || apiKey.startsWith('your_') || provider === 'none') {
    return { success: false, isConfigured: false, fallback: true };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s request timeout

  try {
    if (provider === 'gemini') {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      
      const contents = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const payload = {
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nRespond ONLY in valid JSON format matching the intent schema.` }] },
          ...contents,
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: maxTokens,
          responseMimeType: 'application/json',
        },
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`[TicketHarbour AI] Gemini API returned status ${res.status}`);
        return { success: false, fallback: true };
      }

      const data = await res.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textResponse) return { success: false, fallback: true };

      return {
        success: true,
        provider: 'gemini',
        model: modelName,
        text: textResponse.trim(),
      };
    } else if (provider === 'openai') {
      const endpoint = 'https://api.openai.com/v1/chat/completions';
      
      const payload = {
        model: modelName,
        messages: [
          { role: 'system', content: `${systemPrompt}\nRespond ONLY in valid JSON.` },
          ...messages,
        ],
        temperature: 0.2,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`[TicketHarbour AI] OpenAI API returned status ${res.status}`);
        return { success: false, fallback: true };
      }

      const data = await res.json();
      const textResponse = data.choices?.[0]?.message?.content;

      if (!textResponse) return { success: false, fallback: true };

      return {
        success: true,
        provider: 'openai',
        model: modelName,
        text: textResponse.trim(),
      };
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`[TicketHarbour AI Provider Exception]: ${err.message}`);
    return { success: false, fallback: true };
  }

  return { success: false, fallback: true };
};
