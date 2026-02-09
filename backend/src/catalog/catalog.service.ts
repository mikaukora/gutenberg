import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import { Book, BooksResponse } from './book.interface';

const CATALOG_URL =
  'https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv';

@Injectable()
export class CatalogService implements OnModuleInit {
  private readonly logger = new Logger(CatalogService.name);
  private books: Book[] = [];
  private languages: string[] = [];

  getCatalogPath(): string {
    return (
      process.env.CATALOG_CSV_PATH ||
      path.resolve(__dirname, '..', '..', '..', 'pg_catalog.csv')
    );
  }

  onModuleInit() {
    this.loadCatalog();
  }

  reloadCatalog(): void {
    try {
      this.loadCatalog();
    } catch (err) {
      this.logger.error('Failed to reload catalog', err);
      // Keep serving existing in-memory data
    }
  }

  private loadCatalog() {
    const csvPath = this.getCatalogPath();
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

    this.books.sort(
      (a, b) => new Date(b.issued).getTime() - new Date(a.issued).getTime(),
    );

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

  async downloadCatalog(): Promise<void> {
    const csvPath = this.getCatalogPath();
    const dir = path.dirname(csvPath);
    const tmpPath = path.join(dir, 'pg_catalog.csv.tmp');

    this.logger.log('Downloading catalog from Project Gutenberg...');

    const res = await fetch(CATALOG_URL);
    if (!res.ok) {
      throw new Error(`Download failed: ${res.status} ${res.statusText}`);
    }

    const buffer = await res.arrayBuffer();
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(tmpPath, Buffer.from(buffer), 'utf-8');
    fs.renameSync(tmpPath, csvPath);

    this.logger.log('Catalog download complete.');
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
      const term = search.trim().toLowerCase().replace(/\s+/g, ' ');

      const isLikelyPersonName =
        term.length > 0 &&
        term.length <= 60 &&
        term.split(' ').length === 2 &&
        !term.includes('@') &&
        !/[0-9]/.test(term);

      let authorTerms: string[] = [];
      if (isLikelyPersonName) {
        const [first, last] = term.split(' ');
        const fullName = `${first} ${last}`.trim();
        const inverted = `${last}, ${first}`.trim();
        authorTerms = Array.from(new Set([fullName, inverted]));
      }

      filtered = filtered.filter((book) => {
        const title = book.title.toLowerCase();
        const authors = book.authors.toLowerCase();
        const subjects = book.subjects.toLowerCase();
        const shelves = book.bookshelves.toLowerCase();

        if (title.includes(term) || subjects.includes(term) || shelves.includes(term)) {
          return true;
        }

        if (authorTerms.length > 0) {
          return authorTerms.some((t) => authors.includes(t));
        }

        return authors.includes(term);
      });
    }

    const safeLimit = Math.min(100, Math.max(1, limit));
    const safePage = Math.max(1, page);
    const total = filtered.length;
    const totalPages = Math.ceil(total / safeLimit);
    const start = (safePage - 1) * safeLimit;
    const data = filtered.slice(start, start + safeLimit);

    return { data, total, page: safePage, limit: safeLimit, totalPages };
  }
}
