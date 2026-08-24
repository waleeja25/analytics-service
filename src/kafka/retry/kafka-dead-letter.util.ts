import { Logger } from '@nestjs/common';
import { KafkaContext } from '@nestjs/microservices';

import { commitOffset } from './kafka-offset';

export async function sendToDeadLetter(
  context: KafkaContext,
  deadLetterTopic: string,
  error: unknown,
  retryCount = 0,
): Promise<void> {
  const producer = context.getProducer();
  const message = context.getMessage();

  await producer.send({
    topic: deadLetterTopic,
    messages: [
      {
        value: JSON.stringify({
          originalTopic: context.getTopic(),
          value: message.value,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
          retryCount,
        }),
      },
    ],
  });
}

export async function deadLetterAndCommit(
  context: KafkaContext,
  deadLetterTopic: string,
  error: unknown,
  logger: Logger,
  identifier: string | number = context.getTopic(),
  retryCount = 0,
): Promise<void> {
  try {
    await sendToDeadLetter(context, deadLetterTopic, error, retryCount);
    await commitOffset(context);
  } catch (dlqError) {
    logger.error(
      `Failed to publish message ${identifier} to dead letter topic. Offset NOT committed.`,
      dlqError instanceof Error ? dlqError.stack : dlqError,
    );
  }
}
