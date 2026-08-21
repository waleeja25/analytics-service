import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, RpcException } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

import { AppModule } from './app.module';
import { getKafkaOptions } from './kafka';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors: ValidationError[]) =>
        new RpcException(
          errors
            .flatMap((error) => Object.values(error.constraints ?? {}))
            .join('; '),
        ),
    }),
  );

  const kafkaServer = app.connectMicroservice<MicroserviceOptions>(
    getKafkaOptions(configService),
    { inheritAppConfig: true },
  );

  app.enableShutdownHooks();

  kafkaServer.status.subscribe((status) => {
    console.log(`Kafka consumer status: ${status}`);
  });

  await app.startAllMicroservices();

  await app.listen(port ?? 3004);

  console.log(`Analytics Service HTTP running on port ${port ?? 3004}`);
  console.log('Analytics Service Kafka consumer is running');
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
