import {
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CatalogRefreshService } from './catalog-refresh.service';
import * as crypto from 'crypto';

@Controller('api/admin')
export class CatalogAdminController {
  constructor(private readonly refreshService: CatalogRefreshService) {}

  @Post('refresh-catalog')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async refreshCatalog(
    @Headers('x-refresh-secret') secret: string | undefined,
  ): Promise<{ ok: true }> {
    const expected = process.env.REFRESH_SECRET;
    if (!expected) {
      throw new UnauthorizedException();
    }
    const expectedBuf = Buffer.from(expected, 'utf8');
    const secretBuf = Buffer.from(secret ?? '', 'utf8');
    if (secretBuf.length !== expectedBuf.length) {
      crypto.timingSafeEqual(Buffer.alloc(expectedBuf.length), expectedBuf);
      throw new UnauthorizedException();
    }
    if (!crypto.timingSafeEqual(secretBuf, expectedBuf)) {
      throw new UnauthorizedException();
    }
    await this.refreshService.refreshCatalog();
    return { ok: true };
  }
}
