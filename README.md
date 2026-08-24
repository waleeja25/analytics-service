# Analytics Service

Consumes `order.created`/`order.deleted` events from Kafka (published by `order-service`) and maintains daily revenue totals.

## Message handling

- Every processed `(orderId, eventType)` pair is recorded in a `processed_orders` table, so a redelivered message is detected and skipped instead of double-counting revenue.
- Payloads are validated with `class-validator` DTOs before reaching the handler.
- Offset commits are fully manual (`autoCommit: false`): the offset only advances after the handler succeeds, or after a failed message is successfully published to the dead-letter topic. If that dead-letter publish itself fails, the offset is left uncommitted so the message is redelivered rather than lost.
- **Malformed message**: sent straight to the dead-letter topic, no retries.
- **Handler failure**: retried with exponential backoff, then dead-lettered if retries are exhausted. The dead-letter topic is created in code on startup.

## Stack

NestJS, `kafkajs` / `@nestjs/microservices` (Kafka), TypeORM, MySQL, `class-validator`

## Folder structure

```
src/
├── analytics/               # controller, service, entities, events, event-type constants
├── kafka/
│   ├── kafka-options.ts       # consumer connection config
│   ├── kafka-dlq.ts           # creates the dead-letter topic on startup
│   ├── constants/
│   └── retry/                  # retry service, dead-letter + offset-commit utils
├── common/filters/              # KafkaExceptionFilter
├── config/
└── health/
```

## Running locally

```bash
npm install
npm run start:dev
```

HTTP health check on `PORT` (default `3004`). Schema is managed by TypeORM `synchronize: true` here, not migrations.

## Required env vars

```
PORT=3004
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_NAME=analytics_db
KAFKA_BROKER=localhost:9092
KAFKA_DEAD_LETTER_TOPIC=analytics.dead-letter
```

## Depends on

A running MySQL instance with an `analytics_db` database, and a running Kafka broker.
