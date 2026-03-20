// src/services/geminiService.js

import { GEMINI_API_KEY, GEMINI_URL } from '../constants/config';

export const generateQuiz = async (topic, difficulty = 'medium', count = 5) => {
  const prompt = `Generate exactly ${count} multiple choice questions about "${topic}". Difficulty: ${difficulty}. Return ONLY a JSON array, no markdown, no backticks, no extra text. Format: [{"question":"...","options":["A","B","C","D"],"correctAnswer":"A","explanation":"..."}]`;

  try {
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    });

    // Step 1 - response aaya?
    if (!response.ok) {
      console.error('Gemini HTTP error:', response.status);
      return getFallback(topic, count);
    }

    const data = await response.json();
    console.log('Gemini raw response:', JSON.stringify(data));

    // Step 2 - candidates exist karta hai?
    if (!data || !data.candidates || !data.candidates[0]) {
      console.error('No candidates in response');
      return getFallback(topic, count);
    }

    // Step 3 - content exist karta hai?
    const content = data.candidates[0]?.content;
    if (!content || !content.parts || !content.parts[0]) {
      console.error('No content parts in response');
      return getFallback(topic, count);
    }

    // Step 4 - text nikalo
    let raw = content.parts[0].text || '';
    console.log('Raw text:', raw);

    // Step 5 - clean karo markdown
    raw = raw
      .replace(/```json/gi, '')
      .replace(/```/gi, '')
      .trim();

    // Step 6 - JSON array dhundo agar extra text hai
    const startIdx = raw.indexOf('[');
    const endIdx   = raw.lastIndexOf(']');

    if (startIdx === -1 || endIdx === -1) {
      console.error('No JSON array found in response');
      return getFallback(topic, count);
    }

    const jsonStr = raw.substring(startIdx, endIdx + 1);

    // Step 7 - parse karo
    const questions = JSON.parse(jsonStr);

    // Step 8 - validate karo
    if (!Array.isArray(questions) || questions.length === 0) {
      console.error('Invalid questions array');
      return getFallback(topic, count);
    }

    // Step 9 - har question validate karo
    const valid = questions.map(q => ({
      question     : q.question      || 'Question not available',
      options      : Array.isArray(q.options) && q.options.length === 4
                       ? q.options
                       : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: q.correctAnswer || q.options?.[0] || 'Option A',
      explanation  : q.explanation   || 'No explanation available.',
    }));

    return valid;

  } catch (error) {
    console.error('Gemini service error:', error);
    return getFallback(topic, count);
  }
};

// Fallback questions - app crash nahi hoga
const getFallback = (topic, count) => {
  return Array.from({ length: count }, (_, i) => ({
    question     : `Question ${i + 1}: What is an important concept in ${topic}?`,
    options      : ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 'Option A',
    explanation  : 'Please check your Gemini API key in src/constants/config.js',
  }));
};


// TEMPORARY TEST - file ke top mein add karo
export const testGemini = async () => {
  try {
    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDL-RulKyPqn7bkC0bPw5WKC7B9jITIfpA',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Say hello in one word' }] }],
        }),
      }
    );
    const data = await res.json();
    console.log('TEST RESULT:', JSON.stringify(data));
  } catch (e) {
    console.error('TEST ERROR:', e.message);
  }
};