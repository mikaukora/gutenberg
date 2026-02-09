import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production',
    }),
  );
  if (process.env.NODE_ENV === 'production') {
    const origin = process.env.CORS_ORIGIN;
    app.enableCors({
      origin: origin ? origin.split(',').map((o) => o.trim()) : false,
    });
  } else {
    app.enableCors({ origin: 'http://localhost:3000' });
  }
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
