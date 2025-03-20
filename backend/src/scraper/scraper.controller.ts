import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get('jobs')
  getJobs() {
    return this.scraperService.getJobListings();
  }

  @Get('pages')
  getPages() {
    return this.scraperService.getCareerPages();
  }

  @Post('pages')
  addPage(@Body() data: { url: string; name: string }) {
    return this.scraperService.addCareerPage(data.url, data.name);
  }

  @Delete('pages/:url')
  removePage(@Param('url') url: string) {
    return this.scraperService.removeCareerPage(decodeURIComponent(url));
  }

  @Post('scrape')
  scrapeAll() {
    return this.scraperService.scrapeAllPages();
  }
}
