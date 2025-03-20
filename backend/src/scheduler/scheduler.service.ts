import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as cron from 'node-cron';
import { ScraperService } from '../scraper/scraper.service';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);
  private cronJob: cron.ScheduledTask;
  private interval: '1h' | '6h' = '1h';

  constructor(private readonly scraperService: ScraperService) {}

  onModuleInit() {
    this.startScheduler();
  }

  startScheduler() {
    // Stop existing job if any
    if (this.cronJob) {
      this.cronJob.stop();
    }

    // Set cron expression based on interval
    const cronExpression = this.interval === '1h' ? '0 * * * *' : '0 */6 * * *';

    this.logger.log(`Starting scheduler with interval: ${this.interval}`);

    this.cronJob = cron.schedule(cronExpression, async () => {
      this.logger.log('Running scheduled job scraping');
      await this.scraperService.scrapeAllPages();
    });
  }

  setInterval(interval: '1h' | '6h') {
    this.interval = interval;
    this.startScheduler();
    return this.interval;
  }

  getInterval() {
    return this.interval;
  }
}
