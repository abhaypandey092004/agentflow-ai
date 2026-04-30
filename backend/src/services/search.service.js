const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

/**
 * Perform a web search using Tavily API
 * @param {string} query - The search query
 * @returns {Promise<string>} - A structured summary of search results
 */
async function searchWeb(query) {
  if (!TAVILY_API_KEY) {
    console.warn('[SEARCH] No TAVILY_API_KEY found. Falling back to local knowledge simulation.');
    return `Simulation of research for: "${query}". (Note: Please provide TAVILY_API_KEY for real search results).`;
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: query,
        search_depth: "smart",
        include_images: false,
        max_results: 5
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(`Tavily API Error: ${errData.detail || response.statusText}`);
    }

    const data = await response.json();
    
    // Format the results into a structured string for the AI to process
    const structuredResults = data.results.map((res, index) => {
      return `[Source ${index + 1}]: ${res.title}\nURL: ${res.url}\nContent: ${res.content}\n`;
    }).join('\n---\n\n');

    return `Web Research Results for: "${query}"\n\n${structuredResults}`;
  } catch (err) {
    console.error('[SEARCH] Error performing web search:', err);
    throw new Error('Web search failed. Check your API configuration.');
  }
}

module.exports = { searchWeb };
