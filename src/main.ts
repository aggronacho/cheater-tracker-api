import * as fs from 'fs';
import * as path from 'path';
import helmet from 'helmet';
import * as morgan from 'morgan';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors();
  app.use(morgan('combined'));
  app.useGlobalPipes(new ValidationPipe());

  if (process.env.NODE_ENV !== 'prod') {
    const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
    let version = 'NOT_FOUND';

    if (fs.existsSync(packageJsonPath)) {
      const fileContent = fs.readFileSync(packageJsonPath).toString();
      const jsonObj = JSON.parse(fileContent);

      version = jsonObj.version;
    }

    const config = new DocumentBuilder()
      .setTitle('Cheater API')
      .setDescription('API to track cheaters')
      .setVersion(version)
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(3000);
}

bootstrap();
