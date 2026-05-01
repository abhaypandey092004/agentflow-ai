const supabase = require('../config/supabase');

const defaultTemplates = [
  {
    name: 'Research & Summarize',
    description: 'Deeply researches a topic and provides a concise summary of key findings.',
    type: 'RESEARCH',
    prompt: 'Research the following topic in depth: {{input}}. Then, provide a bulleted summary of the most important aspects, focusing on current trends and future implications.'
  },
  {
    name: 'Email Drafter',
    description: 'Converts rough notes or bullet points into a professional, well-structured email.',
    type: 'CONTENT',
    prompt: 'Based on the following notes, draft a professional email: {{input}}. Ensure the tone is appropriate for a business setting and the call to action is clear.'
  },
  {
    name: 'Data Extractor',
    description: 'Extracts structured information from unstructured text or documents.',
    type: 'DATA',
    prompt: 'Extract all names, dates, and locations from the following text and format them as a JSON object: {{input}}'
  },
  {
    name: 'Code Reviewer',
    description: 'Analyzes code snippets for potential bugs, performance issues, and best practices.',
    type: 'DEVELOPMENT',
    prompt: 'Review the following code snippet: {{input}}. Identify potential bugs, security vulnerabilities, and suggest improvements for better performance and readability.'
  },
  {
    name: 'Content Rewrite',
    description: 'Rewrites text to change the tone or improve clarity while maintaining the original meaning.',
    type: 'REWRITE',
    prompt: 'Rewrite the following text to be more engaging and persuasive: {{input}}. Maintain the core message but use more vivid language and a compelling narrative style.'
  }
];

const getTemplates = async (req, res, next) => {
  try {
    let { data, error } = await supabase
      .from('prompt_templates')
      .select('*')
      .order('name');

    if (error) throw error;

    // Auto-seed if empty
    if (!data || data.length === 0) {
      const { data: seededData, error: seedError } = await supabase
        .from('prompt_templates')
        .insert(defaultTemplates)
        .select();
      
      if (seedError) {
        console.error('Seeding failed:', seedError);
      } else {
        data = seededData;
      }
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTemplates
};
