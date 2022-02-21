import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const PORT = process.env.PORT || 3001;
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const config = new DocumentBuilder().setTitle('Документация OpenFreeMap').setDescription('Документация к REST API Open Free Map').setVersion('1.0.0').build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, doc);

  await app.listen(PORT ?? 3000, () => console.log(`Server started on port = ${PORT}`));
}

bootstrap();
