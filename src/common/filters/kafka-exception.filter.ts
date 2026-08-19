import { Catch, Logger, RpcExceptionFilter } from '@nestjs/common';
import { Observable, of } from 'rxjs';

@Catch()
export class KafkaExceptionFilter implements RpcExceptionFilter {
  private readonly logger = new Logger(KafkaExceptionFilter.name);

  catch(exception: unknown): Observable<unknown> {
    this.logger.error(
      `Failed to process Kafka message: ${exception instanceof Error ? exception.stack : String(exception)}`,
    );
    return of(undefined);
  }
}
