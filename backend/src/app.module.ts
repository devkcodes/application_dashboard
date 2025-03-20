import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScraperService } from './scraper/scraper.service';
import { ScraperController } from './scraper/scraper.controller';
import { SchedulerService } from './scheduler/scheduler.service';
import { SchedulerController } from './scheduler/scheduler.controller';

@Module({
  imports: [],
  controllers: [AppController, ScraperController, SchedulerController],
  providers: [AppService, ScraperService, SchedulerService],
})
export class AppModule {}
