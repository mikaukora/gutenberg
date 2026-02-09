const API_BASE = '/api';

export interface Book {
  textId: number;
  type: string;
  issued: string;
  title: string;
  language: string;
  authors: string;
  subjects: string;
  locc: string;
  bookshelves: string;
}

export interface BooksResponse {
  data: Book[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function fetchLanguages(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/languages`);
  if (!res.ok) throw new Error('Failed to fetch languages');
  return res.json();
}

export async function fetchBooks(params: {
  language?: string;
  search?: string;
  page?: number;
  limit?: number;
  signal?: AbortSignal;
}): Promise<BooksResponse> {
  const query = new URLSearchParams();
  if (params.language) query.set('language', params.language);
  if (params.search) query.set('search', params.search);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const res = await fetch(`${API_BASE}/books?${query.toString()}`, {
    signal: params.signal,
  });
  if (!res.ok) throw new Error('Failed to fetch books');
  return res.json();
}
