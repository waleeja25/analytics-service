import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DailyOrderStat, ProcessedOrder } from './entities';
import type { OrderCreatedEvent, OrderDeletedEvent } from './events';
import { EVENT_TYPES } from './constants/event-type.constants';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(DailyOrderStat)
    private readonly dailyOrderStatRepository: Repository<DailyOrderStat>,

    @InjectRepository(ProcessedOrder)
    private readonly processedOrderRepository: Repository<ProcessedOrder>,
  ) {}

  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    const alreadyProcessed = await this.processedOrderRepository.findOne({
      where: {
        orderId: event.orderId,
        eventType: EVENT_TYPES.ORDER_CREATED,
      },
    });

    if (alreadyProcessed) {
      return;
    }

    const date = new Date().toISOString().split('T')[0];

    let dailyStats = await this.dailyOrderStatRepository.findOne({
      where: {
        date,
      },
    });

    if (!dailyStats) {
      dailyStats = this.dailyOrderStatRepository.create({
        date,
        totalRevenue: event.totalAmount,
      });
    } else {
      dailyStats.totalRevenue =
        Number(dailyStats.totalRevenue) + Number(event.totalAmount);
    }

    await this.dailyOrderStatRepository.save(dailyStats);

    await this.processedOrderRepository.save({
      orderId: event.orderId,
      eventType: EVENT_TYPES.ORDER_CREATED,
    });

    this.logger.log(`Successfully processed order ${event.orderId}`);
  }

  async handleOrderDeleted(event: OrderDeletedEvent): Promise<void> {
    const alreadyProcessed = await this.processedOrderRepository.findOne({
      where: {
        orderId: event.orderId,
        eventType: EVENT_TYPES.ORDER_DELETED,
      },
    });

    if (alreadyProcessed) {
      return;
    }

    const date = new Date().toISOString().split('T')[0];

    let dailyStats = await this.dailyOrderStatRepository.findOne({
      where: {
        date,
      },
    });

    if (!dailyStats) {
      dailyStats = this.dailyOrderStatRepository.create({
        date,
        totalRevenue: -event.totalAmount,
      });
    } else {
      dailyStats.totalRevenue =
        Number(dailyStats.totalRevenue) - Number(event.totalAmount);
    }

    await this.dailyOrderStatRepository.save(dailyStats);

    await this.processedOrderRepository.save({
      orderId: event.orderId,
      eventType: EVENT_TYPES.ORDER_DELETED,
    });

    this.logger.log(`Successfully processed order ${event.orderId}`);
  }
}
