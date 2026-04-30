const env = require('../config/env');
const openai = require('../config/openai');

const executeStep = async (stepType, prompt, model, previousOutput = '') => {
  if (!openai) {
    throw new Error('OpenAI API is not configured.');
  }

  const systemPrompts = {
    research: "You are a world-class research analyst. Analyze the provided search data and extract critical facts, statistics, and insights. Structure your findings logically.",
    summarize: "You are an expert at synthesis. Take the provided information and distill it into a concise, high-impact summary while retaining all essential nuances.",
    generate: "You are an elite content creator and copywriter. Create engaging, high-quality content that is SEO-optimized, well-structured with headings, and perfectly tailored to the user's objective.",
    rewrite: "You are a meticulous editor. Refine the provided text for clarity, tone, and professional impact.",
    extract: "You are a data extraction specialist. Identify and structure key entities, dates, and metrics from the provided text into a clean format.",
    custom: "You are a helpful AI assistant tasked with following instructions precisely."
  };

  const systemPrompt = systemPrompts[stepType] || systemPrompts.custom;
  let userPrompt = prompt;

  if (previousOutput) {
    userPrompt = `CONTEXT FROM PREVIOUS STEPS:\n${previousOutput}\n\nCURRENT TASK:\n${prompt}`;
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
        max_tokens: 2500,
      });

      return response.choices[0].message.content;
    } catch (error) {
      const isRateLimit = error.status === 429;
      const isQuotaError =
        error.code === 'insufficient_quota' ||
        error.message?.toLowerCase().includes('quota');

      if (isQuotaError) {
        throw new Error('AI Budget Exceeded: Please check your billing dashboard.');
      }

      if (isRateLimit && attempt < maxRetries) {
        console.warn(`[AI-SERVICE] Rate limit hit. Retrying... (Attempt ${attempt + 1})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retryDelay *= 2;
        continue;
      }

      console.error('[AI-SERVICE] OpenAI Error:', error.message);
      throw new Error('AI temporarily unavailable. Please try again.');
    }
  }
};

module.exports = {
  executeStep
};
