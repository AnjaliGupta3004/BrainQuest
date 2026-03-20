// src/services/libraryService.js

import { OPEN_LIBRARY_URL } from '../constants/config';

export const searchBooks = async (query) => {
  try {
    const url = `${OPEN_LIBRARY_URL}?q=${encodeURIComponent(query)}&limit=12&fields=title,author_name,subject,key,cover_i`;
    const response = await fetch(url);
    const data = await response.json();

    return data.docs.map(book => ({
      key    : book.key || Math.random().toString(),
      title  : book.title || 'Unknown Title',
      author : book.author_name?.[0] || 'Unknown Author',
      subject: book.subject?.[0] || query,
      cover  : book.cover_i
               ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
               : null,
    }));
  } catch (error) {
    console.error('Library error:', error);
    return [];
  }
};