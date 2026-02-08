import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogRefreshService } from './catalog-refresh.service';
import { CatalogService } from './catalog.service';

@Module({
  controllers: [CatalogController],
  providers: [CatalogService, CatalogRefreshService],
  exports: [CatalogService, CatalogRefreshService],
})
export class CatalogModule {}
