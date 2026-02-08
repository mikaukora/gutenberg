import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CatalogAdminController } from './catalog-admin.controller';
import { CatalogRefreshService } from './catalog-refresh.service';

describe('CatalogAdminController', () => {
  let controller: CatalogAdminController;
  let refreshCatalog: jest.SpyInstance;

  beforeEach(async () => {
    refreshCatalog = jest.fn().mockResolvedValue(undefined);
  });

  const createModule = async (refreshSecret: string | undefined) => {
    const prev = process.env.REFRESH_SECRET;
    process.env.REFRESH_SECRET = refreshSecret;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogAdminController],
      providers: [
        {
          provide: CatalogRefreshService,
          useValue: { refreshCatalog },
        },
      ],
    }).compile();

    controller = module.get<CatalogAdminController>(CatalogAdminController);
    return () => {
      process.env.REFRESH_SECRET = prev;
    };
  };

  afterEach(() => {
    delete process.env.REFRESH_SECRET;
  });

  describe('when REFRESH_SECRET is set', () => {
    beforeEach(async () => {
      await createModule('my-secret');
    });

    it('returns 200 and { ok: true } when X-Refresh-Secret matches', async () => {
      const result = await controller.refreshCatalog('my-secret');
      expect(refreshCatalog).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: true });
    });

    it('throws UnauthorizedException when header is missing', async () => {
      await expect(
        controller.refreshCatalog(undefined),
      ).rejects.toThrow(UnauthorizedException);
      expect(refreshCatalog).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when header does not match', async () => {
      await expect(
        controller.refreshCatalog('wrong-secret'),
      ).rejects.toThrow(UnauthorizedException);
      expect(refreshCatalog).not.toHaveBeenCalled();
    });
  });

  describe('when REFRESH_SECRET is empty', () => {
    beforeEach(async () => {
      await createModule('');
    });

    it('throws UnauthorizedException even with matching value', async () => {
      await expect(
        controller.refreshCatalog(''),
      ).rejects.toThrow(UnauthorizedException);
      expect(refreshCatalog).not.toHaveBeenCalled();
    });
  });
});
