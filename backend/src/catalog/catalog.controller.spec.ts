import { Test, TestingModule } from '@nestjs/testing';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';

describe('CatalogController', () => {
  let controller: CatalogController;
  let getLanguages: jest.SpyInstance;
  let getBooks: jest.SpyInstance;

  beforeEach(async () => {
    getLanguages = jest.fn().mockReturnValue(['en', 'fi']);
    getBooks = jest.fn().mockReturnValue({
      data: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
      refreshedAt: new Date().toISOString(),
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [
        {
          provide: CatalogService,
          useValue: { getLanguages, getBooks },
        },
      ],
    }).compile();

    controller = module.get<CatalogController>(CatalogController);
  });

  describe('getLanguages', () => {
    it('returns languages from CatalogService', () => {
      const result = controller.getLanguages();
      expect(getLanguages).toHaveBeenCalledTimes(1);
      expect(result).toEqual(['en', 'fi']);
    });
  });

  describe('getBooks', () => {
    it('calls getBooks with query (defaults)', () => {
      controller.getBooks({ page: 1, limit: 50 });
      expect(getBooks).toHaveBeenCalledWith(undefined, undefined, 1, 50);
    });

    it('passes language, search, page and limit from query', () => {
      controller.getBooks({
        language: 'fi',
        search: 'kalevala',
        page: 2,
        limit: 10,
      });
      expect(getBooks).toHaveBeenCalledWith('fi', 'kalevala', 2, 10);
    });

    it('uses page 1 and limit 50 when only optional fields set', () => {
      controller.getBooks({ language: 'en', page: 1, limit: 50 });
      expect(getBooks).toHaveBeenCalledWith('en', undefined, 1, 50);
    });
  });
});
