import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import { Book, BooksResponse } from './book.interface';

@Injectable()
export class CatalogService implements OnModuleInit {
  private readonly logger = new Logger(CatalogService.name);
  private books: Book[] = [];
  private languages: string[] = [];

  onModuleInit() {
    this.loadCatalog();
  }

  private loadCatalog() {
    const csvPath =
      process.env.CATALOG_CSV_PATH ||
      path.resolve(__dirname, '..', '..', '..', 'pg_catalog.csv');
    this.logger.log(`Loading catalog from ${csvPath}`);

    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records: Record<string, string>[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
    });

    this.books = records.map((record) => ({
      textId: parseInt(record['Text#'], 10),
      type: record['Type'] ?? '',
      issued: record['Issued'] ?? '',
      title: record['Title'] ?? '',
      language: record['Language'] ?? '',
      authors: record['Authors'] ?? '',
      subjects: record['Subjects'] ?? '',
      locc: record['LoCC'] ?? '',
      bookshelves: record['Bookshelves'] ?? '',
    }));

    // Sort by issued date descending by default
    this.books.sort(
      (a, b) => new Date(b.issued).getTime() - new Date(a.issued).getTime(),
    );

    // Derive unique languages
    const langSet = new Set<string>();
    for (const book of this.books) {
      if (book.language) {
        langSet.add(book.language);
      }
    }
    this.languages = Array.from(langSet).sort();

    this.logger.log(
      `Loaded ${this.books.length} books with ${this.languages.length} unique language values`,
    );
  }

  getLanguages(): string[] {
    return this.languages;
  }

  getBooks(
    language?: string,
    search?: string,
    page = 1,
    limit = 50,
  ): BooksResponse {
    let filtered = this.books;

    if (language) {
      const langs = language.split(',').map((l) => l.trim().toLowerCase());
      filtered = filtered.filter((book) =>
        langs.some((l) => book.language.toLowerCase() === l),
      );
    }

    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(term) ||
          book.authors.toLowerCase().includes(term) ||
          book.subjects.toLowerCase().includes(term) ||
          book.bookshelves.toLowerCase().includes(term),
      );
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return { data, total, page, limit, totalPages };
  }
}
