import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnalyticsService } from './analytics.service';
import { DailyOrderStat } from './entities';
import { ProcessedOrder } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([DailyOrderStat, ProcessedOrder])],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
