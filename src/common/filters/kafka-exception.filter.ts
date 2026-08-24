import {
  ArgumentsHost,
  Catch,
  Logger,
  RpcExceptionFilter,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaContext, RpcException } from '@nestjs/microservices';
import { from, Observable, of } from 'rxjs';

import { deadLetterAndCommit } from '../../kafka';

@Catch()
export class KafkaExceptionFilter implements RpcExceptionFilter {
  private readonly logger = new Logger(KafkaExceptionFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): Observable<unknown> {
    this.logger.error(
      `Failed to process Kafka message: ${exception instanceof Error ? exception.stack : String(exception)}`,
    );

    if (!(exception instanceof RpcException)) {
      return of(undefined);
    }

    const context = host.switchToRpc().getContext<KafkaContext>();

    return from(
      deadLetterAndCommit(
        context,
        this.configService.getOrThrow<string>('kafka.deadLetterTopic'),
        exception,
        this.logger,
      ),
    );
  }
}
