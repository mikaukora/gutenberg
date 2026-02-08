import {
  BadRequestException,
  PipeTransform,
  ArgumentMetadata,
} from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  async transform(value: unknown, _metadata: ArgumentMetadata): Promise<unknown> {
    const result = await this.schema.safeParseAsync(value);
    if (result.success) {
      return result.data;
    }
    const body = this.formatZodError(result.error);
    throw new BadRequestException(body);
  }

  private formatZodError(error: ZodError): { message: string; errors: Record<string, string[]> } {
    const formatted: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const path = issue.path.join('.') || 'request';
      if (!formatted[path]) formatted[path] = [];
      formatted[path].push(issue.message);
    }
    return { message: 'Validation failed', errors: formatted };
  }
}
