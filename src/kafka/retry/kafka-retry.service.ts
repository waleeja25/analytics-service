import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaContext } from '@nestjs/microservices';

import { KAFKA_RETRY } from '../constants';
import { deadLetterAndCommit } from './kafka-dead-letter.util';
import { commitOffset } from './kafka-offset';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class KafkaRetryService {
  private readonly logger = new Logger(KafkaRetryService.name);

  constructor(private readonly configService: ConfigService) {}

  async handle(
    context: KafkaContext,
    identifier: string | number,
    handler: () => Promise<void> | void,
  ): Promise<void> {
    for (let attempt = 0; attempt <= KAFKA_RETRY.MAX_ATTEMPTS; attempt++) {
      try {
        await handler();
        await commitOffset(context);
        return;
      } catch (error) {
        if (attempt === KAFKA_RETRY.MAX_ATTEMPTS) {
          this.logger.error(
            `Message ${identifier} failed after ${KAFKA_RETRY.MAX_ATTEMPTS} attempts. Sending to dead letter topic.`,
            error instanceof Error ? error.stack : error,
          );

          await deadLetterAndCommit(
            context,
            this.configService.getOrThrow<string>('kafka.deadLetterTopic'),
            error,
            this.logger,
            identifier,
            attempt,
          );
          return;
        }

        const backoffMs = KAFKA_RETRY.BASE_DELAY_MS * 2 ** attempt;
        this.logger.warn(
          `Message ${identifier} failed. Retrying ${attempt + 1}/${KAFKA_RETRY.MAX_ATTEMPTS} in ${backoffMs}ms: ${error instanceof Error ? error.message : error}`,
        );

        await delay(backoffMs);
      }
    }
  }
}
