import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';

import { AnalyticsService } from './analytics.service';
import { OrderCreatedEvent, OrderDeletedEvent } from './events';
import { EVENT_TYPES } from './constants/event-type.constants';
import { KafkaRetryService } from '../kafka';

@Controller()
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly kafkaRetryService: KafkaRetryService,
  ) {}

  @EventPattern(EVENT_TYPES.ORDER_CREATED)
  async handleOrderCreated(
    @Payload() event: OrderCreatedEvent,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    this.logger.log(
      `Analytics: Order #${event.orderId} created with revenue ${event.totalAmount}. Updating total revenue.`,
    );

    await this.kafkaRetryService.handle(context, event.orderId, () =>
      this.analyticsService.handleOrderCreated(event),
    );
  }

  @EventPattern(EVENT_TYPES.ORDER_DELETED)
  async handleOrderDeleted(
    @Payload() event: OrderDeletedEvent,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    this.logger.log(
      `Analytics: Order #${event.orderId} deleted. Removing revenue ${event.totalAmount} from total revenue.`,
    );

    await this.kafkaRetryService.handle(context, event.orderId, () =>
      this.analyticsService.handleOrderDeleted(event),
    );
  }
}
