const env = require('../config/env');
const openai = require('../config/openai');

const MOCK_RESPONSES = {
  research: (prompt) => `## Research Summary

**Topic:** ${prompt.substring(0, 60)}...

### Key Findings

1. **Primary Insight** — The subject matter reveals significant patterns in current data trends. Cross-referencing multiple authoritative sources confirms a consistent trajectory toward increased adoption and relevance.

2. **Market Analysis** — Industry reports from Q1 2025 indicate a 34% year-over-year growth rate. Leading organizations have pivoted their strategic priorities to accommodate these shifts.

3. **Technical Overview** — Core mechanisms rely on layered architectures that enable scalable, modular deployments. The interoperability with existing infrastructure remains a critical success factor.

4. **Challenges & Risks** — Regulatory uncertainty, data privacy concerns, and integration complexity present the most significant barriers to adoption. Mitigation strategies require multi-stakeholder coordination.

5. **Future Outlook** — Projected developments over the next 18–24 months suggest continued growth, with emerging frameworks expected to reduce friction substantially.

> *Note: This is a simulated research output generated in mock mode.*`,

  summarize: (prompt, previousOutput) => `## Executive Summary

${previousOutput ? '**Based on the previous step\'s output:**\n\n' : ''}The provided content covers several interconnected themes. Below is a concise synthesis of the most critical points:

- **Core Message:** The material presents a structured argument for process optimization through intelligent automation.
- **Supporting Evidence:** Three distinct data points reinforce the central thesis, each drawing from independent methodologies.
- **Actionable Takeaway:** Decision-makers should prioritize the integration of adaptive systems to remain competitive in evolving landscapes.
- **Confidence Level:** High — the source material is internally consistent and aligns with established domain knowledge.

*Word count reduced by ~78% while retaining 100% of key information.*

> *Note: This is a simulated summary generated in mock mode.*`,

  generate: (prompt) => `## Generated Content

**Prompt Interpreted As:** ${prompt.substring(0, 80)}...

---

In a world where information flows faster than ever before, the ability to synthesize knowledge into clear, compelling narratives is the defining skill of the modern era. Organizations that master this art don't just communicate — they inspire, persuade, and drive meaningful action.

Consider the implications: every interaction is an opportunity to build trust, establish authority, and create lasting value. The most effective communicators understand that authenticity and precision are not mutually exclusive — they are complementary forces that, when combined, produce extraordinary results.

This content has been crafted to align with your specified tone and objectives. It is optimized for clarity, engagement, and impact across your target audience segments.

**Estimated Reading Time:** 2 minutes  
**Readability Score:** Grade 10 (Flesch-Kincaid)

> *Note: This is simulated generated content produced in mock mode.*`,

  rewrite: (prompt, previousOutput) => `## Rewritten & Refined Content

${previousOutput ? '**Original source from previous step — enhanced below:**\n\n' : ''}**Before:** Dense, passive-voice constructions that obscure meaning and reduce reader engagement across all demographics and literacy levels.

**After:**

Clarity drives results. The revised version strips away unnecessary complexity, replacing passive constructions with active, purposeful language. Each sentence now carries its weight — no filler, no ambiguity.

Key improvements applied:
- ✅ Active voice throughout (85% of sentences)
- ✅ Reduced average sentence length from 28 to 16 words
- ✅ Eliminated 12 instances of redundant phrasing
- ✅ Upgraded 6 weak verbs to precise action words
- ✅ Improved paragraph flow with logical connective tissue

The result is content that respects the reader's time while maximizing persuasive impact.

> *Note: This is a simulated rewrite generated in mock mode.*`,

  extract: (prompt, previousOutput) => `## Extracted Data

**Extraction Target:** ${prompt.substring(0, 60)}...

\`\`\`json
{
  "entities": [
    { "type": "Organization", "value": "Acme Corporation", "confidence": 0.97 },
    { "type": "Person", "value": "Jane Doe", "confidence": 0.94 },
    { "type": "Date", "value": "2025-03-15", "confidence": 0.99 }
  ],
  "key_metrics": [
    { "label": "Revenue Growth", "value": "34%", "period": "YoY" },
    { "label": "User Adoption", "value": "12,400", "unit": "new users" }
  ],
  "sentiment": "positive",
  "topics": ["growth", "automation", "AI integration", "scalability"],
  "summary": "Document discusses organizational growth strategies with a focus on AI-driven automation."
}
\`\`\`

**Extraction Confidence:** 96.2% average across all fields.

> *Note: This is simulated extracted data generated in mock mode.*`,

  custom: (prompt) => `## Custom AI Output

**Processing Request:** ${prompt.substring(0, 80)}...

---

Your custom instruction has been processed. The AI engine analyzed your specific parameters and generated the following tailored response:

The output integrates contextual understanding with domain-specific reasoning to deliver a result that precisely matches your requirements. The processing pipeline applied advanced natural language inference to map your intent to structured output.

**Processing Statistics:**
- Tokens processed: 1,247
- Model: gpt-4o-mini (simulated)
- Latency: 1.5s (mock)
- Confidence: 94.7%

> *Note: This is a simulated custom output generated in mock mode.*`,
};

const executeStep = async (stepType, prompt, model, previousOutput = '') => {
  // Check for Mock Mode — skip OpenAI entirely
  if (env.openai.mockMode) {
    console.log(`[AI-MOCK] Executing step type "${stepType}" with realistic mock data...`);
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800)); // Simulate 1.2–2s delay
    const mockFn = MOCK_RESPONSES[stepType] || MOCK_RESPONSES.custom;
    return mockFn(prompt, previousOutput);
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
