import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

export function getKafkaOptions(
  configService: ConfigService,
): MicroserviceOptions {
  return {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'analytics-service',
        brokers: [configService.getOrThrow<string>('kafka.broker')],
      },
      consumer: {
        groupId: 'analytics-service-group',
      },
    },
  };
}
