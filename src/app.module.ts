import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppConfigModule, getTypeOrmConfig } from './config';
import { AnalyticsModule } from './analytics';

@Module({
  imports: [
    AppConfigModule,
    AnalyticsModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
  ],
})
export class AppModule {}
