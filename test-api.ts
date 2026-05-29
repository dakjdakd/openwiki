import 'dotenv/config';
import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
const baseURL = process.env.OPENAI_BASE_URL ?? 'https://api.deepseek.com';

console.log('API Key length:', apiKey?.length);
console.log('API Key prefix:', apiKey?.substring(0, 10));
console.log('Base URL:', baseURL);

const ai = new OpenAI({ baseURL, apiKey });

async function test() {
  try {
    const result = await ai.chat.completions.create({
      model: 'deepseek-v4-flash',
      messages: [{ role: 'user', content: 'say hi' }],
      max_tokens: 10,
    });
    console.log('SUCCESS:', result.choices[0]?.message?.content);
  } catch (err: any) {
    console.error('Status:', err?.status);
    console.error('Error:', err?.message);
  }
}

test();