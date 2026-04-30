const env = require('../config/env');
const openai = require('../config/openai');

const executeStep = async (stepType, prompt, model, previousOutput = '') => {
  // Check for Mock Mode
  if (env.openai.mockMode) {
    console.log(`[AI-MOCK] Executing ${stepType} step with mock data...`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
    return `[MOCK RESPONSE for ${stepType}] This is a simulated AI response for your prompt: "${prompt.substring(0, 30)}..."`;
  }

  if (!openai) {
    throw new Error('OpenAI API is not configured.');
  }

  let systemPrompt = 'You are a helpful AI assistant.';
  let userPrompt = prompt;

  if (previousOutput) {
    userPrompt = `Previous Output Context:\n${previousOutput}\n\nTask Prompt:\n${prompt}`;
  }

  switch (stepType) {
    case 'research':
      systemPrompt = 'You are an expert research assistant. Provide detailed, well-structured, and factual information based on the prompt.';
      break;
    case 'summarize':
      systemPrompt = 'You are an expert summarizer. Extract the key points and provide a concise summary of the provided text.';
      break;
    case 'generate':
      systemPrompt = 'You are a creative content generator. Create engaging and original content based on the prompt.';
      break;
    case 'rewrite':
      systemPrompt = 'You are an expert editor. Rewrite the provided text to improve clarity, tone, and impact while maintaining the original meaning.';
      break;
    case 'extract':
      systemPrompt = 'You are a data extraction expert. Extract the requested specific information from the text accurately and format it clearly.';
      break;
    case 'custom':
      // Use default system prompt
      break;
    default:
      throw new Error(`Unsupported step type: ${stepType}`);
  }

  const maxRetries = 3;
  let retryDelay = 2000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      return response.choices[0].message.content;
    } catch (error) {
      const isRateLimit = error.status === 429;
      const isQuotaError = error.message?.includes('quota') || error.code === 'insufficient_quota';
      
      // If quota error, fail immediately (no point in retrying)
      if (isQuotaError) {
        console.error('[AI-SERVICE] Insufficient OpenAI quota. Billing update required.');
        throw new Error('Your AI processing limit (quota) has been reached. Please check your OpenAI billing dashboard.');
      }

      // If rate limit, retry with exponential backoff
      if (isRateLimit && attempt < maxRetries) {
        console.warn(`[AI-SERVICE] Rate limit hit. Retrying in ${retryDelay}ms... (Attempt ${attempt + 1})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retryDelay *= 2;
        continue;
      }

      console.error('[AI-SERVICE] OpenAI Error:', error.message);
      throw new Error(error.message || 'The AI engine encountered an unexpected error. Please try again.');
    }
  }
};

module.exports = {
  executeStep
};
