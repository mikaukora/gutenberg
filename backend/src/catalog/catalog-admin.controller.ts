import {
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { CatalogRefreshService } from './catalog-refresh.service';

@Controller('api/admin')
export class CatalogAdminController {
  constructor(private readonly refreshService: CatalogRefreshService) {}

  @Post('refresh-catalog')
  @HttpCode(HttpStatus.OK)
  async refreshCatalog(
    @Headers('x-refresh-secret') secret: string | undefined,
  ): Promise<{ ok: true }> {
    const expected = process.env.REFRESH_SECRET;
    if (!expected || secret !== expected) {
      throw new UnauthorizedException();
    }
    await this.refreshService.refreshCatalog();
    return { ok: true };
  }
}
