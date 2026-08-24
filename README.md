# Analytics Service

Consumes `order.created`/`order.deleted` events from Kafka (published by `order-service`) and maintains daily revenue totals.

## Message handling

- Every processed `(orderId, eventType)` pair is recorded in a `processed_orders` table before/after applying it, so a redelivered message is detected and skipped instead of double-counting revenue — this matters because Kafka only guarantees *at-least-once* delivery, not exactly-once.
- Payloads are validated with `class-validator` DTOs before reaching the handler.
- **Malformed message** (fails validation): sent straight to the `KAFKA_DEAD_LETTER_TOPIC` topic, no retries.
- **Handler failure** on an otherwise-valid message: retried with exponential backoff via `KafkaRetryService`, then dead-lettered if retries are exhausted.

## Known limitation

Revenue is bucketed by the date the message was *processed*, not the date the order was actually created — a delayed or retried message can land in the wrong day's total.

## Stack

NestJS, `kafkajs` / `@nestjs/microservices` (Kafka), TypeORM, MySQL, `class-validator`

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
