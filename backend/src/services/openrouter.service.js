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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
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

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[OPENROUTER ERROR] Status:", response.status, "Details:", JSON.stringify(errorData));
      
      if (response.status === 401) {
        throw new Error("AI service authentication failed. Please check configuration.");
      }
      if (response.status === 429) {
        throw new Error("AI service rate limit exceeded. Please try again later.");
      }
      
      throw new Error("AI Synthesis disruption. Please try again later.");
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content || "";
    
    if (!resultText) {
      console.error("[OPENROUTER ERROR] Empty response content:", JSON.stringify(data));
      throw new Error("AI failed to generate a response. Please try again.");
    }


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
    if (err.name === 'AbortError') {
      throw new Error('AI synthesis timed out after 60 seconds.');
    }
    console.error("runAI Exception:", err.message);
    const safeMessage = err.message === 'AI service is not configured' 
      ? err.message 
      : "AI synthesis unavailable. Please try again later.";
    throw new Error(safeMessage);
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = { runAI };
