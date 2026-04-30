const { OpenAI } = require('openai');
const env = require('./env');

let openai = null;

if (env.openai.apiKey) {
  openai = new OpenAI({
    apiKey: env.openai.apiKey,
  });
} else {
  console.warn('OPENAI_API_KEY is not set. AI features will not work.');
}

module.exports = openai;
