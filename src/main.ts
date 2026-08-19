import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { ValidationPipe } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ValidationError } from 'class-validator';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port');

  const kafkaServer = app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'analytics-service',
          brokers: [process.env.KAFKA_BROKER!],
        },
        consumer: {
          groupId: 'analytics-service-group',
        },
      },
    },
    { inheritAppConfig: true },
  );

  app.enableShutdownHooks();

  kafkaServer.status.subscribe((status) => {
    console.log(`Kafka consumer status: ${status}`);
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (errors: ValidationError[]) =>
        new RpcException(
          errors
            .flatMap((error) => Object.values(error.constraints ?? {}))
            .join('; '),
        ),
    }),
  );

  await app.startAllMicroservices();

  await app.listen(port ?? 3004);

  console.log(`Analytics Service HTTP running on port ${port ?? 3004}`);
  console.log('Analytics Service Kafka consumer is running');
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
