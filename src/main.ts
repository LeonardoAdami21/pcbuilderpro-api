import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: false,
  });

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });

  const config = new DocumentBuilder()
    .setTitle('Loja virtual de compras e venda de PC')
    .setDescription('API para loja virtual de compras e venda de PC')
    .addServer('http://localhost:7000', 'Development')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/v1/docs', app, document, {
    // Garante que as "tags/módulos" fiquem em ordem alfabética na UI do Swagger.
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.APP_PORT as string;
  const host = process.env.APP_HOST as string;
  await app.listen(port, host, () => {
    console.log(`Server running on port ${port}/v1`);
    console.log(`Swagger running on http://localhost:${port}/v1/docs`);
  });
}
bootstrap();
