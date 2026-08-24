import { Kafka } from 'kafkajs';

export async function setupDeadLetterTopic(
  brokers: string[],
  topic: string,
): Promise<void> {
  const kafka = new Kafka({
    clientId: 'analytics-service-admin',
    brokers,
  });

  const admin = kafka.admin();
  await admin.connect();

  try {
    await admin.createTopics({
      topics: [
        {
          topic,
          numPartitions: 1,
          replicationFactor: 1,
        },
      ],
    });
  } finally {
    await admin.disconnect();
  }
}
