import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const configService = app.get(ConfigService);
  const baseUrl = configService.get<string>('BASE_URL');
  const config = new DocumentBuilder()
    .setTitle('Movie Watchlist API')
    .setDescription(`API consuming TMDB API and creating/managing a watchlist from it. Authenticate from the root index url, get the token, and use the authorize below to use the API with the token. [Authentication URL](${baseUrl})`)
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
