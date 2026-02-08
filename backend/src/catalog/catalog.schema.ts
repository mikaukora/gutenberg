import { z } from 'zod';

const MAX_SEARCH_LENGTH = 500;
const MAX_LANGUAGE_LENGTH = 100;

export const booksQuerySchema = z.object({
  language: z
    .string()
    .max(MAX_LANGUAGE_LENGTH)
    .optional()
    .transform((s) => (s === '' ? undefined : s)),
  search: z
    .string()
    .max(MAX_SEARCH_LENGTH)
    .optional()
    .transform((s) => (s === '' ? undefined : s)),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type BooksQuery = z.infer<typeof booksQuerySchema>;
