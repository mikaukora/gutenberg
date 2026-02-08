import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CatalogAdminModule } from './catalog/catalog-admin.module';
import { CatalogModule } from './catalog/catalog.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api/{*any}'],
    }),
    CatalogModule,
    ...(process.env.REFRESH_SECRET ? [CatalogAdminModule] : []),
  ],
})
export class AppModule {}
