import { registerAs } from '@nestjs/config';

export const kafkaConfig = registerAs('kafka', () => ({
  broker: process.env.KAFKA_BROKER,
}));
