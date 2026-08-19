import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppConfigModule, getTypeOrmConfig } from './config';
import { AnalyticsModule } from './analytics';
import { HealthModule } from './health/health.module';

import { APP_FILTER } from '@nestjs/core';
import { KafkaExceptionFilter } from './common';

@Module({
  imports: [
    AppConfigModule,
    AnalyticsModule,
    HealthModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: KafkaExceptionFilter,
    },
  ],
})
export class AppModule {}
