import { Controller, Get, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import type { BooksResponse } from './book.interface';
import { booksQuerySchema, type BooksQuery } from './catalog.schema';
import { ZodValidationPipe } from '../common/zod-validation.pipe';

@Controller('api')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('languages')
  getLanguages(): string[] {
    return this.catalogService.getLanguages();
  }

  @Get('books')
  getBooks(
    @Query(new ZodValidationPipe(booksQuerySchema)) query: BooksQuery,
  ): BooksResponse {
    return this.catalogService.getBooks(
      query.language,
      query.search,
      query.page,
      query.limit,
    );
  }
}
