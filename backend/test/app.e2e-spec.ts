import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as path from 'path';
import request from 'supertest';
import { AppModule } from '../src/app.module';

const FIXTURE_PATH = path.join(
  __dirname,
  'fixtures',
  'pg_catalog_sample.csv',
);

describe('Catalog API (e2e)', () => {
  let app: INestApplication;

  beforeAll(() => {
    process.env.CATALOG_CSV_PATH = FIXTURE_PATH;
  });

  afterAll(() => {
    delete process.env.CATALOG_CSV_PATH;
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/languages', () => {
    it('returns 200 and array of language codes', () => {
      return request(app.getHttpServer())
        .get('/api/languages')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toContain('en');
          expect(res.body).toContain('fi');
        });
    });
  });

  describe('GET /api/books', () => {
    it('returns 200 and paginated books', () => {
      return request(app.getHttpServer())
        .get('/api/books')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total', 5);
          expect(res.body).toHaveProperty('page', 1);
          expect(res.body).toHaveProperty('limit', 50);
          expect(res.body).toHaveProperty('totalPages', 1);
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBe(5);
        });
    });

    it('filters by language when language query is provided', () => {
      return request(app.getHttpServer())
        .get('/api/books?language=fi')
        .expect(200)
        .expect((res) => {
          expect(res.body.total).toBe(3);
          res.body.data.forEach((book: { language: string }) => {
            expect(book.language).toBe('fi');
          });
        });
    });

    it('filters by search term', () => {
      return request(app.getHttpServer())
        .get('/api/books?search=Kalevala')
        .expect(200)
        .expect((res) => {
          expect(res.body.total).toBe(1);
          expect(res.body.data[0].title).toBe('Kalevala');
        });
    });

    it('respects page and limit', () => {
      return request(app.getHttpServer())
        .get('/api/books?page=2&limit=2')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBe(2);
          expect(res.body.page).toBe(2);
          expect(res.body.limit).toBe(2);
          expect(res.body.total).toBe(5);
          expect(res.body.totalPages).toBe(3);
        });
    });
  });

  describe('POST /api/admin/refresh-catalog', () => {
    it('returns 404 when REFRESH_SECRET is not set (admin route disabled)', () => {
      return request(app.getHttpServer())
        .post('/api/admin/refresh-catalog')
        .set('X-Refresh-Secret', 'any')
        .expect(404);
    });
  });
});
