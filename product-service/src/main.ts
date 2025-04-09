import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Configure microservice
  const microserviceOptions: MicroserviceOptions = {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: configService.get<number>('MICROSERVICE_PORT', 3002),
    },
  };
  
  app.connectMicroservice(microserviceOptions);
  
  // Start all microservices and then start the HTTP server
  await app.startAllMicroservices();
  
  // Also keep the HTTP server for backward compatibility
  const httpPort = configService.get<number>('PORT', 3002);
  await app.listen(httpPort);
  
  console.log(`Product Service is running on port ${httpPort}`);
  console.log(`Product Microservice is listening on port ${configService.get<number>('MICROSERVICE_PORT', 3002)}`);
}
bootstrap();
