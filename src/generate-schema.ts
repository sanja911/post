import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function generateSchema() {
  const app = await NestFactory.create(AppModule);
  await app.init();
  await app.close();
}

generateSchema();
