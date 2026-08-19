import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { AnalyticsService } from './analytics.service';
import { OrderCreatedEvent } from './events/order-created.event';

@Controller()
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  @EventPattern('order.created')
  async handleOrderCreated(@Payload() event: OrderCreatedEvent): Promise<void> {
    this.logger.log(
      `Processing order ${event.orderId} with revenue ${event.totalAmount}`,
    );

    await this.analyticsService.handleOrderCreated(event);
  }
}
