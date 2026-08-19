import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from './app.config';
import databaseConfig from './database.config';
import { envValidationSchema } from './env.validation';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,

      load: [appConfig, databaseConfig],

      validationSchema: envValidationSchema,
    }),
  ],

  exports: [ConfigModule],
})
export class AppConfigModule {}
