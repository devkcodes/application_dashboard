import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  source: string;
  scrapedAt: Date;
}

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);
  private careerPages: { url: string; name: string }[] = [];
  private jobListings: JobListing[] = [];

  addCareerPage(url: string, name: string) {
    // Check if already exists
    const exists = this.careerPages.some((page) => page.url === url);
    if (!exists) {
      this.careerPages.push({ url, name });
      this.logger.log(`Added career page: ${name} (${url})`);
      // Scrape immediately when added
      this.scrapeCareerPage(url, name);
    }
    return this.careerPages;
  }

  removeCareerPage(url: string) {
    this.careerPages = this.careerPages.filter((page) => page.url !== url);
    return this.careerPages;
  }

  getCareerPages() {
    return this.careerPages;
  }

  getJobListings() {
    return this.jobListings;
  }

  async scrapeAllPages() {
    this.logger.log('Starting scrape of all career pages');
    const newJobs: JobListing[] = [];

    for (const page of this.careerPages) {
      try {
        const jobs = await this.scrapeCareerPage(page.url, page.name);
        newJobs.push(...jobs);
      } catch (error) {
        this.logger.error(`Error scraping ${page.name}: ${error.message}`);
      }
    }

    this.logger.log(
      `Scraping complete. Found ${newJobs.length} new job listings`,
    );
    return newJobs;
  }

  async scrapeCareerPage(
    url: string,
    companyName: string,
  ): Promise<JobListing[]> {
    this.logger.log(`Scraping career page: ${companyName} (${url})`);

    try {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);
      const newJobs: JobListing[] = [];

      // This is a generic scraper that will need customization for specific sites
      // We'll look for common job listing patterns

      // Try to find job listings with different selectors
      const selectors = [
        '.jobs-list .job-item', // Common pattern
        '.careers-jobs .job', // Another common pattern
        '.opening', // Greenhouse
        '.job-listing', // Lever
        'tr.job-listing', // Workday-like
        '.job-card', // Another common pattern
      ];

      let jobElements = $('');

      // Try each selector until we find something
      for (const selector of selectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          jobElements = elements;
          break;
        }
      }

      // If we found job elements, extract the data
      jobElements.each((i, el) => {
        // Try different selectors for job title
        const titleSelectors = [
          '.job-title',
          '.title',
          'h3',
          'h4',
          'h2',
          'a strong',
        ];
        let title = '';
        for (const selector of titleSelectors) {
          const titleEl = $(el).find(selector).first();
          if (titleEl.length > 0) {
            title = titleEl.text().trim();
            break;
          }
        }

        // Try different selectors for location
        const locationSelectors = [
          '.location',
          '.job-location',
          '.meta .location',
        ];
        let location = '';
        for (const selector of locationSelectors) {
          const locationEl = $(el).find(selector).first();
          if (locationEl.length > 0) {
            location = locationEl.text().trim();
            break;
          }
        }

        // Try to find the job URL
        let jobUrl = '';
        const linkEl = $(el).find('a').first();
        if (linkEl.length > 0) {
          jobUrl = linkEl.attr('href') || '';
          // Handle relative URLs
          if (jobUrl && !jobUrl.startsWith('http')) {
            const urlObj = new URL(url);
            if (jobUrl.startsWith('/')) {
              jobUrl = `${urlObj.origin}${jobUrl}`;
            } else {
              jobUrl = `${urlObj.origin}/${jobUrl}`;
            }
          }
        }

        if (title && jobUrl) {
          const id = `${companyName}-${title}-${location}`
            .replace(/\s+/g, '-')
            .toLowerCase();

          // Check if job already exists
          const exists = this.jobListings.some((job) => job.id === id);

          if (!exists) {
            const job: JobListing = {
              id,
              title,
              company: companyName,
              location: location || 'Remote/Unspecified',
              url: jobUrl,
              source: url,
              scrapedAt: new Date(),
            };

            this.jobListings.push(job);
            newJobs.push(job);
          }
        }
      });

      this.logger.log(`Found ${newJobs.length} new jobs from ${companyName}`);
      return newJobs;
    } catch (error) {
      this.logger.error(`Error scraping ${url}: ${error.message}`);
      return [];
    }
  }
}
