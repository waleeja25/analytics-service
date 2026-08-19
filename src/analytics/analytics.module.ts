import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { DailyOrderStat } from './entities';
import { ProcessedOrder } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([DailyOrderStat, ProcessedOrder])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
