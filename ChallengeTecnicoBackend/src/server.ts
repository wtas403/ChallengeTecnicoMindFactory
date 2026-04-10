import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';

async function bootstrap() {
  const app = createApp();

  await prisma.$connect();

  app.listen(env.PORT, () => {
    console.log(`API listening on port ${env.PORT}`);
  });
}

void bootstrap();
