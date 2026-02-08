import { Module } from '@nestjs/common';
import { CatalogAdminController } from './catalog-admin.controller';
import { CatalogModule } from './catalog.module';

@Module({
  imports: [CatalogModule],
  controllers: [CatalogAdminController],
})
export class CatalogAdminModule {}
