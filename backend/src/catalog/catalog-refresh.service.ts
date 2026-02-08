import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { CatalogService } from './catalog.service';

const REFRESH_JOB_NAME = 'catalog-refresh';

@Injectable()
export class CatalogRefreshService implements OnModuleInit {
  private readonly logger = new Logger(CatalogRefreshService.name);

  constructor(
    private readonly catalogService: CatalogService,
    private readonly scheduler: SchedulerRegistry,
  ) {}

  onModuleInit() {
    const cronExpr = process.env.CATALOG_REFRESH_CRON;
    if (cronExpr === '') {
      this.logger.log(
        'Daily catalog refresh disabled (CATALOG_REFRESH_CRON is empty)',
      );
      return;
    }
    const expr = cronExpr ?? '0 2 * * *';
    const job = new CronJob(expr, () => {
      this.refreshCatalog();
    });
    this.scheduler.addCronJob(REFRESH_JOB_NAME, job);
    job.start();
    this.logger.log(`Daily catalog refresh scheduled: ${expr}`);
  }

  async refreshCatalog(): Promise<void> {
    try {
      await this.catalogService.downloadCatalog();
      this.catalogService.reloadCatalog();
      this.logger.log('Catalog refresh completed successfully.');
    } catch (err) {
      this.logger.error('Catalog refresh failed', err);
    }
  }
}
