import OpenAI from 'openai';

let ai: OpenAI | null = null;

function normalizeApiKey(value: string | undefined): string {
  const trimmed = (value ?? '').trim().replace(/^['"]|['"]$/g, '');
  return trimmed.replace(/^Bearer\s+/i, '').trim();
}

function getAiClient(): OpenAI {
  if (ai) return ai;

  const apiKey = normalizeApiKey(process.env.OPENAI_API_KEY);
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is missing. Add a valid sk-... key to .env and restart the dev server.');
  }

  ai = new OpenAI({
    baseURL: (process.env.OPENAI_BASE_URL ?? 'https://api.deepseek.com').trim().replace(/\/+$/, ''),
    apiKey,
  });

  return ai;
}

export async function generateWithRetry(params: {
  model: string;
  contents: string;
  config?: {
    systemInstruction?: string;
    responseMimeType?: string;
    responseSchema?: Record<string, any>;
  };
}, maxRetries = 5): Promise<{ text: string }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
      if (params.config?.systemInstruction) {
        messages.push({
          role: 'system',
          content: params.config.systemInstruction,
        });
      }
      messages.push({ role: 'user', content: params.contents });

      const chatParams: OpenAI.Chat.ChatCompletionCreateParams = {
        model: params.model,
        messages,
      };

      // DeepSeek's OpenAI-compatible endpoint supports JSON mode more broadly
      // than provider-specific structured output schemas.
      if (params.config?.responseMimeType === 'application/json' || params.config?.responseSchema) {
        chatParams.response_format = { type: 'json_object' };
      }

      const result = await getAiClient().chat.completions.create(chatParams);
      return { text: result.choices[0]?.message?.content ?? '' };
    } catch (error: any) {
      const errStr = String(error);
      const isRetryable =
        error?.status === 429 ||
        error?.status === 503 ||
        errStr.includes('429') ||
        errStr.includes('503') ||
        errStr.includes('rate limit') ||
        errStr.includes('high demand');

      if (isRetryable && attempt < maxRetries) {
        const delay = attempt * 3000;
        console.warn(
          `OpenAI API unavailable, retrying in ${delay}ms... (Attempt ${attempt} of ${maxRetries})`
        );
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }
      // Log full error details for debugging
      console.error('AI API Error:', {
        status: error?.status,
        message: error?.message,
        code: error?.code,
        type: error?.type,
        headers: error?.response?.headers,
        body: error?.response?.data,
      });
      throw error;
    }
  }
  throw new Error('Failed to generate content after retries');
}

export const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    summary: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        targetUser: { type: 'string' },
        coreFunctionality: { type: 'string' },
        entryFile: { type: 'string' },
        dataFlow: { type: 'string' },
        startHere: { type: 'array', items: { type: 'string' } },
      },
      required: ['summary', 'targetUser', 'coreFunctionality', 'entryFile', 'dataFlow', 'startHere'],
    },
    fileTree: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          path: { type: 'string' },
          type: { type: 'string' },
          explanation: { type: 'string' },
          importance: { type: 'string' },
        },
        required: ['path', 'type', 'explanation', 'importance'],
      },
    },
    modules: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          files: { type: 'string' },
          responsibility: { type: 'string' },
          why: { type: 'string' },
          suggestion: { type: 'string' },
        },
        required: ['id', 'name', 'files', 'responsibility', 'why', 'suggestion'],
      },
    },
    lessons: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          goal: { type: 'string' },
          files: { type: 'array', items: { type: 'string' } },
          why: { type: 'string' },
          focus: { type: 'string' },
          questions: { type: 'array', items: { type: 'string' } },
          exercise: { type: 'string' },
        },
        required: ['id', 'title', 'goal', 'files', 'why', 'focus', 'questions', 'exercise'],
      },
    },
    architecture: { type: 'string' },
    business: {
      type: 'object',
      properties: {
        positioning: { type: 'string' },
        problems: { type: 'string' },
        users: { type: 'string' },
        painPoints: { type: 'string' },
        coreValue: { type: 'string' },
        competitors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              edge: { type: 'string' },
            },
            required: ['name', 'edge'],
          },
        },
        model: { type: 'string' },
        mvp: { type: 'string' },
        growth: { type: 'string' },
        risks: { type: 'string' },
        future: { type: 'string' },
      },
      required: [
        'positioning',
        'problems',
        'users',
        'painPoints',
        'coreValue',
        'competitors',
        'model',
        'mvp',
        'growth',
        'risks',
        'future',
      ],
    },
  },
  required: ['summary', 'fileTree', 'modules', 'lessons', 'architecture', 'business'],
};
