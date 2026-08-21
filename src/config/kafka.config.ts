import { registerAs } from '@nestjs/config';

export const kafkaConfig = registerAs('kafka', () => ({
  broker: process.env.KAFKA_BROKER,
  deadLetterTopic: process.env.KAFKA_DEAD_LETTER_TOPIC,
}));
