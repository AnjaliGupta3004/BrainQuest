// src/services/aiService.js

import {GROQ_URL } from '../constants/config';
import { GROQ_API_KEY } from '@env';

export const generateQuiz = async (topic, difficulty = 'medium', count = 5) => {
console.log("API KEY:", GROQ_API_KEY);
  const prompt = `Generate exactly ${count} multiple choice questions about "${topic}".
Difficulty: ${difficulty}.
Return ONLY a valid JSON array. No markdown. No backticks. No explanation. Just raw JSON.
Format:
[
  {
    "question": "Question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Why this is correct."
  }
]`;

  try {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a quiz generator. Return only valid JSON arrays.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Groq error:', err);
      return getFallback(topic, count);
    }

    const data = await response.json();
    console.log('Groq response:', JSON.stringify(data));

    let raw = data?.choices?.[0]?.message?.content || '';

    // Clean markdown agar ho
    raw = raw.replace(/```json/gi, '').replace(/```/gi, '').trim();

    // JSON array extract karo
    const startIdx = raw.indexOf('[');
    const endIdx   = raw.lastIndexOf(']');

    if (startIdx === -1 || endIdx === -1) {
      console.error('No JSON array found');
      return getFallback(topic, count);
    }

    const questions = JSON.parse(raw.substring(startIdx, endIdx + 1));

    if (!Array.isArray(questions) || questions.length === 0) {
      return getFallback(topic, count);
    }

    return questions.map(q => ({
      question     : q.question      || 'Question not available',
      options      : Array.isArray(q.options) && q.options.length === 4
                       ? q.options
                       : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: q.correctAnswer || q.options?.[0] || 'Option A',
      explanation  : q.explanation   || 'No explanation available.',
    }));

  } catch (error) {
    console.error('AI Service error:', error);
    return getFallback(topic, count);
  }
};

const getFallback = (topic, count) => {
  return Array.from({ length: count }, (_, i) => ({
    question     : `Question ${i + 1}: What is an important concept in ${topic}?`,
    options      : ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 'Option A',
    explanation  : 'Fallback question — API se connect nahi hua.',
  }));
};