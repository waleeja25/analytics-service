import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DailyOrderStat, ProcessedOrder } from './entities';
import type { OrderCreatedEvent } from './events';

@Injectable()
export class AnalyticsService {
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
    });
  }
}
