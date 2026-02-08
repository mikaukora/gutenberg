import { Test, TestingModule } from '@nestjs/testing';
import * as path from 'path';
import { CatalogService } from './catalog.service';

const FIXTURE_PATH = path.join(
  __dirname,
  '..',
  '..',
  'test',
  'fixtures',
  'pg_catalog_sample.csv',
);

describe('CatalogService', () => {
  let service: CatalogService;

  beforeEach(async () => {
    process.env.CATALOG_CSV_PATH = FIXTURE_PATH;

    const module: TestingModule = await Test.createTestingModule({
      providers: [CatalogService],
    }).compile();

    service = module.get<CatalogService>(CatalogService);
    service.onModuleInit();
  });

  afterEach(() => {
    delete process.env.CATALOG_CSV_PATH;
  });

  describe('getCatalogPath', () => {
    it('returns CATALOG_CSV_PATH when set', () => {
      const prev = process.env.CATALOG_CSV_PATH;
      process.env.CATALOG_CSV_PATH = '/custom/path.csv';
      const s = new CatalogService();
      expect(s.getCatalogPath()).toBe('/custom/path.csv');
      process.env.CATALOG_CSV_PATH = prev;
    });

    it('returns default path when CATALOG_CSV_PATH is unset', () => {
      const prev = process.env.CATALOG_CSV_PATH;
      delete process.env.CATALOG_CSV_PATH;
      const s = new CatalogService();
      const got = s.getCatalogPath();
      expect(got).toContain('pg_catalog.csv');
      process.env.CATALOG_CSV_PATH = prev;
    });
  });

  describe('getLanguages', () => {
    it('returns sorted unique languages from the catalog', () => {
      const langs = service.getLanguages();
      expect(langs).toEqual(['en', 'fi']);
    });
  });

  describe('getBooks', () => {
    it('returns all books sorted by issued date descending', () => {
      const res = service.getBooks();
      expect(res.data.length).toBe(5);
      expect(res.total).toBe(5);
      expect(res.page).toBe(1);
      expect(res.limit).toBe(50);
      expect(res.totalPages).toBe(1);
      expect(res.data[0].issued).toBe('2020-01-15');
      expect(res.data[1].issued).toBe('2005-07-01');
    });

    it('filters by language', () => {
      const res = service.getBooks('fi');
      expect(res.total).toBe(3);
      expect(res.data.every((b) => b.language === 'fi')).toBe(true);
    });

    it('filters by language case-insensitively', () => {
      const res = service.getBooks('FI');
      expect(res.total).toBe(3);
    });

    it('filters by search term across title, authors, subjects, bookshelves', () => {
      const res = service.getBooks(undefined, 'Kalevala');
      expect(res.total).toBe(1);
      expect(res.data[0].title).toBe('Kalevala');
    });

    it('search is case-insensitive', () => {
      const res = service.getBooks(undefined, 'kalevala');
      expect(res.total).toBe(1);
    });

    it('paginates correctly', () => {
      const res = service.getBooks(undefined, undefined, 1, 2);
      expect(res.data.length).toBe(2);
      expect(res.total).toBe(5);
      expect(res.page).toBe(1);
      expect(res.limit).toBe(2);
      expect(res.totalPages).toBe(3);
    });

    it('returns page 2 with limit 2', () => {
      const res = service.getBooks(undefined, undefined, 2, 2);
      expect(res.data.length).toBe(2);
      expect(res.page).toBe(2);
      // Data is sorted by issued desc: 5,3,2,4,1 → page 2 = [2, 4]
      expect(res.data[0].textId).toBe(2);
    });

    it('parses page and limit from defaults when not provided', () => {
      const res = service.getBooks();
      expect(res.limit).toBe(50);
      expect(res.page).toBe(1);
    });
  });

  describe('reloadCatalog', () => {
    it('keeps serving existing data when reload fails', () => {
      const prev = process.env.CATALOG_CSV_PATH;
      process.env.CATALOG_CSV_PATH = '/nonexistent/path.csv';
      service.reloadCatalog();
      expect(service.getBooks().total).toBe(5);
      process.env.CATALOG_CSV_PATH = prev;
    });
  });
});
