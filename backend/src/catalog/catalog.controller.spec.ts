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
    it('calls getBooks with no params and uses default page/limit', () => {
      controller.getBooks();
      expect(getBooks).toHaveBeenCalledWith(undefined, undefined, 1, 50);
    });

    it('passes language, search, and parses page and limit', () => {
      controller.getBooks('fi', 'kalevala', '2', '10');
      expect(getBooks).toHaveBeenCalledWith('fi', 'kalevala', 2, 10);
    });

    it('uses page 1 and limit 50 when query params are missing', () => {
      controller.getBooks(undefined, undefined, undefined, undefined);
      expect(getBooks).toHaveBeenCalledWith(
        undefined,
        undefined,
        1,
        50,
      );
    });

    it('clamps limit to 100 when given over 100', () => {
      controller.getBooks(undefined, undefined, '1', '999');
      expect(getBooks).toHaveBeenCalledWith(undefined, undefined, 1, 100);
    });

    it('clamps page to 1 when given 0 or negative', () => {
      controller.getBooks(undefined, undefined, '0', '50');
      expect(getBooks).toHaveBeenCalledWith(undefined, undefined, 1, 50);
      getBooks.mockClear();
      controller.getBooks(undefined, undefined, '-1', '50');
      expect(getBooks).toHaveBeenCalledWith(undefined, undefined, 1, 50);
    });

    it('treats invalid page/limit as default', () => {
      controller.getBooks(undefined, undefined, 'abc', 'xyz');
      expect(getBooks).toHaveBeenCalledWith(undefined, undefined, 1, 50);
    });
  });
});
