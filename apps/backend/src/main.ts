import 'source-map-support/register';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import { NestFactory } from '@nestjs/core';
import { AppModule } from '@growchief/backend/app.module';
import { ValidationPipe } from '@nestjs/common';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { PermissionExceptionFilter } from '@growchief/shared-backend/billing/permission.exception';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    ...(process.env.FRONTEND_URL
      ? {
          cors: {
            credentials: true,
            exposedHeaders: ['reload', 'onboarding', 'logged', 'activate'],
            origin: [process.env.FRONTEND_URL!],
          },
        }
      : {}),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.use(cookieParser());
  app.use(compression());
  app.useBodyParser('json', { limit: '20mb' });
  app.useGlobalFilters(new PermissionExceptionFilter());

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log('listening on 0.0.0.0:', port);
}
bootstrap();
