const env = require('../config/env');
const supabase = require('../config/supabase');

/**
 * OpenRouter AI Service
 * Model: nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free
 */
async function runAI(userId, prompt, systemPrompt = "You are a helpful AI assistant.") {
  if (!env.openrouter.apiKey) {
    throw new Error('AI service is not configured');
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.openrouter.apiKey}`,
        "HTTP-Referer": "https://agentflow.ai",
        "X-Title": "AgentFlow AI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
        "messages": [
          { "role": "system", "content": systemPrompt },
          { "role": "user", "content": prompt }
        ],
        "temperature": 0.7,
        "max_tokens": 3000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter Error:", errorData);
      throw new Error("AI Synthesis disruption. Please try again later.");
    }

    const data = await response.json();
    const resultText = data.choices[0]?.message?.content || "";

    // Log AI execution in audit_logs
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'ai_execution',
      details: {
        prompt_length: prompt.length,
        model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
        timestamp: new Date().toISOString()
      }
    });

    return resultText;
  } catch (err) {
    console.error("runAI Exception:", err.message);
    const safeMessage = err.message === 'AI service is not configured' 
      ? err.message 
      : "AI synthesis unavailable. Please try again later.";
    throw new Error(safeMessage);
  }
}

module.exports = { runAI };
