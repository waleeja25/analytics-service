import { KafkaContext } from '@nestjs/microservices';

export async function sendToDeadLetter(
  context: KafkaContext,
  deadLetterTopic: string,
  error: unknown,
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
        }),
      },
    ],
  });
}
