import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScraperService } from './scraper/scraper.service';
import { ScraperController } from './scraper/scraper.controller';
import { SchedulerService } from './scheduler/scheduler.service';
import { SchedulerController } from './scheduler/scheduler.controller';
import { JobListing, JobListingSchema } from './schemas/job-listing.schema';
import { CareerPage, CareerPageSchema } from './schemas/career-page.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/job-collector'),
    MongooseModule.forFeature([
      { name: JobListing.name, schema: JobListingSchema },
      { name: CareerPage.name, schema: CareerPageSchema },
    ]),
  ],
  controllers: [AppController, ScraperController, SchedulerController],
  providers: [AppService, ScraperService, SchedulerService],
})
export class AppModule {}
