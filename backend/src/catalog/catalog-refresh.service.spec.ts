import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CatalogRefreshService } from './catalog-refresh.service';
import { CatalogService } from './catalog.service';

describe('CatalogRefreshService', () => {
  let service: CatalogRefreshService;
  let catalogService: { downloadCatalog: jest.Mock; reloadCatalog: jest.Mock };
  let addCronJob: jest.SpyInstance;
  let addedCronJob: { start: jest.Mock; stop: jest.Mock } | undefined;

  beforeEach(async () => {
    catalogService = {
      downloadCatalog: jest.fn().mockResolvedValue(undefined),
      reloadCatalog: jest.fn(),
    };

    const scheduler = {
      addCronJob: jest.fn(),
    };
    addCronJob = jest.spyOn(scheduler, 'addCronJob');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogRefreshService,
        { provide: CatalogService, useValue: catalogService },
        { provide: SchedulerRegistry, useValue: scheduler },
      ],
    }).compile();

    service = module.get<CatalogRefreshService>(CatalogRefreshService);
  });

  describe('refreshCatalog', () => {
    it('calls downloadCatalog then reloadCatalog', async () => {
      await service.refreshCatalog();
      expect(catalogService.downloadCatalog).toHaveBeenCalledTimes(1);
      expect(catalogService.reloadCatalog).toHaveBeenCalledTimes(1);
    });

    it('does not throw when download succeeds', async () => {
      await expect(service.refreshCatalog()).resolves.toBeUndefined();
    });

    it('catches download failure and logs without rethrowing', async () => {
      catalogService.downloadCatalog.mockRejectedValueOnce(
        new Error('Network error'),
      );
      await expect(service.refreshCatalog()).resolves.toBeUndefined();
      expect(catalogService.reloadCatalog).not.toHaveBeenCalled();
    });
  });

  describe('onModuleInit', () => {
    afterEach(() => {
      const job = addCronJob.mock.calls[0]?.[1];
      if (job && typeof job.stop === 'function') job.stop();
    });

    it('registers a cron job when CATALOG_REFRESH_CRON is not empty', () => {
      const prev = process.env.CATALOG_REFRESH_CRON;
      process.env.CATALOG_REFRESH_CRON = '0 3 * * *';
      service.onModuleInit();
      expect(addCronJob).toHaveBeenCalledWith(
        'catalog-refresh',
        expect.any(Object),
      );
      const addedJob = addCronJob.mock.calls[0][1];
      expect(addedJob.start).toBeDefined();
      process.env.CATALOG_REFRESH_CRON = prev;
    });

    it('does not register a cron job when CATALOG_REFRESH_CRON is empty string', () => {
      const prev = process.env.CATALOG_REFRESH_CRON;
      process.env.CATALOG_REFRESH_CRON = '';
      service.onModuleInit();
      expect(addCronJob).not.toHaveBeenCalled();
      process.env.CATALOG_REFRESH_CRON = prev;
    });
  });
});
