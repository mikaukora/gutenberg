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
