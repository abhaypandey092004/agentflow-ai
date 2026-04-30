const env = require('../config/env');
const openai = require('../config/openai');

const executeStep = async (stepType, prompt, model, previousOutput = '') => {
  // Check for Mock Mode — skip OpenAI entirely
  if (env.openai.mockMode) {
    console.log(`[AI-MOCK] Executing step type "${stepType}" with realistic mock data...`);
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800)); // Simulate 1.2–2s delay
    
    const userPrompt = prompt || "No input provided";
    
    return `
## Generated Response (Mock)

User asked:
"${userPrompt}"

### Response:

Here is a detailed blog based on your request:

${userPrompt}

This topic explores key insights, structured explanation, and practical understanding.
The content is written in a clear and engaging format suitable for readers.

### Key Points:
- Introduction to the topic
- Main explanation
- Practical use cases
- Conclusion

*Note: This is a simulated AI response in mock mode.*
`.trim();
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
      const isQuotaError =
        error.code === 'insufficient_quota' ||
        error.status === 429 && error.message?.toLowerCase().includes('quota') ||
        error.message?.toLowerCase().includes('you exceeded your current quota');

      // If quota error, fail immediately — no point retrying a billing issue
      if (isQuotaError) {
        console.error('[AI-SERVICE] OpenAI quota exhausted. Enable OPENAI_MOCK_MODE=true to run demos without billing.');
        throw new Error(
          'OpenAI quota exhausted. Your free-tier credit has been used up. ' +
          'To continue without an OpenAI account, set OPENAI_MOCK_MODE=true in your backend .env file and restart the server.'
        );
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
