import { Controller, Get } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  HealthIndicatorService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { platform } from 'os';
import checkDiskSpace from 'check-disk-space';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const diskPath = platform() === 'win32' ? 'C:\\' : '/';

    return this.health.check([
      () => this.db.pingCheck('database'),

      () => this.memory.checkHeap('memory_heap', 500 * 1024 * 1024),
      () => this.reportMemoryUsage('memory_usage'),

      () =>
        this.disk.checkStorage('disk', {
          path: diskPath,
          thresholdPercent: 0.9,
        }),
      () => this.reportDiskUsage('disk_usage', diskPath),
    ]);
  }

  private reportMemoryUsage(key: string) {
    const { heapUsed, heapTotal, rss } = process.memoryUsage();

    return this.healthIndicatorService.check(key).up({
      heapUsedMB: Math.round(heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(heapTotal / 1024 / 1024),
      rssMB: Math.round(rss / 1024 / 1024),
    });
  }

  private async reportDiskUsage(key: string, path: string) {
    const { free, size } = await checkDiskSpace(path);
    const used = size - free;

    return this.healthIndicatorService.check(key).up({
      usedGB: Math.round(used / 1024 / 1024 / 1024),
      freeGB: Math.round(free / 1024 / 1024 / 1024),
      totalGB: Math.round(size / 1024 / 1024 / 1024),
      usedPercent: Math.round((used / size) * 100),
    });
  }
}
