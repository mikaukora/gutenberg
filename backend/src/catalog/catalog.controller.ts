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
    return this.catalogService.getBooks(
      language,
      search,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }
}
