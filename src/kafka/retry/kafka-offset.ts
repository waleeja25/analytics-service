import { KafkaContext } from '@nestjs/microservices';

export async function commitOffset(context: KafkaContext): Promise<void> {
  const consumer = context.getConsumer();
  const topic = context.getTopic();
  const partition = context.getPartition();
  const { offset } = context.getMessage();

  await consumer.commitOffsets([
    { topic, partition, offset: (Number(offset) + 1).toString() },
  ]);
}
