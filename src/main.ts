import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'analytics-service',
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'analytics-service-group',
      },
    },
  });

  await app.listen();

  console.log('Analytics Service Started!');
}

void bootstrap();
