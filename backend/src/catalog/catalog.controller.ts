import { Controller, Get, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import type { BooksResponse } from './book.interface';

@Controller('api')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('languages')
  getLanguages(): string[] {
    return this.catalogService.getLanguages();
  }

  @Get('books')
  getBooks(
    @Query('language') language?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): BooksResponse {
    const pageNum = Math.max(
      1,
      parseInt(page ?? '1', 10) || 1,
    );
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit ?? '50', 10) || 50),
    );
    return this.catalogService.getBooks(
      language,
      search,
      pageNum,
      limitNum,
    );
  }
}
