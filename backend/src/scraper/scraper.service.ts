import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobListing } from '../schemas/job-listing.schema';
import { CareerPage } from '../schemas/career-page.schema';
import * as puppeteer from 'puppeteer';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(
    @InjectModel(JobListing.name) private jobListingModel: Model<JobListing>,
    @InjectModel(CareerPage.name) private careerPageModel: Model<CareerPage>,
  ) {}

  async addCareerPage(url: string, name: string) {
    // Check if already exists
    const exists = await this.careerPageModel.findOne({ url }).exec();
    if (!exists) {
      const newPage = new this.careerPageModel({ url, name });
      await newPage.save();
      this.logger.log(`Added career page: ${name} (${url})`);
      // Scrape immediately when added
      await this.scrapeCareerPage(url, name);
    }
    return this.getCareerPages();
  }

  async removeCareerPage(url: string) {
    await this.careerPageModel.deleteOne({ url }).exec();
    return this.getCareerPages();
  }

  async getCareerPages() {
    return this.careerPageModel.find().exec();
  }

  async getJobListings() {
    return this.jobListingModel.find().sort({ scrapedAt: -1 }).exec();
  }

  async scrapeAllPages() {
    this.logger.log('Starting scrape of all career pages');
    const newJobs: JobListing[] = [];
    const pages = await this.getCareerPages();

    // Add a delay function
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (const page of pages) {
      try {
        const jobs = await this.scrapeCareerPage(page.url, page.name);
        newJobs.push(...jobs);
        // Add a random delay between requests
        await delay(Math.random() * 3000 + 2000); // 2-5 second delay
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
      // Example of a site-specific scraper
      // if (url.includes('linkedin.com')) {
      //   return this.scrapeLinkedIn(url, companyName);
      // } else if (url.includes('indeed.com')) {
      //   return this.scrapeIndeed(url, companyName);
      // }
      // Fall back to generic scraper

      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2' });
      const html = await page.content();
      await browser.close();

      const $ = cheerio.load(html);
      const newJobs: JobListing[] = [];

      // Log the HTML structure to debug
      this.logger.debug(`HTML structure preview: ${html.substring(0, 500)}...`);

      // Expanded list of selectors for job listings
      const selectors = [
        // Common job board patterns
        '.jobs-list .job-item',
        '.careers-jobs .job',
        '.opening',
        '.job-listing',
        'tr.job-listing',
        '.job-card',
        '.careers-list li',
        '.job-list li',
        '.positions-list .position',
        'article.job',
        // Microsoft specific selectors
        '.card-job',
        'h2.MZGzlrn8gfgSs8TZHhv2',
        '.job-result',
        '.job-tile',
        '.mux-card',
        '.job-search-card',
        // LinkedIn-style selectors
        '.jobs-search-results__list-item',
        '.job-search-card',
        // Indeed-style selectors
        '.jobsearch-ResultsList > li',
        '.tapItem',
        // Greenhouse-style selectors
        '.opening',
        '.position',
        // Lever-style selectors
        '.posting',
        '.posting-item',
        // Workday-style selectors
        '.WF2',
        // Generic selectors as fallbacks
        '.card',
        'div[role="listitem"]',
        'li.list-item',
        // Additional generic patterns
        'div[class*="job-"]',
        'div[class*="career-"]',
        'li[class*="job-"]',
        'div[id*="job-"]',
        'article',
        '.list-group-item',
        'tr.data-row',
        '.vacancy',
        '.position',
      ];

      let jobElements = $('');
      let usedSelector = '';

      // Try each selector until we find something
      for (const selector of selectors) {
        const elements = $(selector);
        this.logger.debug(
          `Selector "${selector}" found ${elements.length} elements`,
        );
        if (elements.length > 0) {
          jobElements = elements;
          usedSelector = selector;
          break;
        }
      }

      // If we still didn't find anything, try a more aggressive approach
      if (jobElements.length === 0) {
        this.logger.log('Trying more aggressive approach...');

        // Look for any elements that might contain job information
        const possibleContainers = [
          'div.card',
          'div.job',
          'div[data-job-id]',
          'div[data-automation-id]',
          'div[class*="job"]',
          'div[class*="career"]',
          'div[class*="position"]',
          'div[class*="vacancy"]',
          'div[class*="opening"]',
          'div[class*="listing"]',
          'li[class*="job"]',
          'tr[class*="job"]',
          'article',
          'section',
        ];

        for (const container of possibleContainers) {
          const elements = $(container);
          this.logger.debug(
            `Container "${container}" found ${elements.length} elements`,
          );
          if (elements.length > 0) {
            jobElements = elements;
            usedSelector = container;
            break;
          }
        }
      }

      // If still no luck, try to find elements with job-related text
      if (jobElements.length === 0) {
        this.logger.log('Trying text-based approach...');

        // Find elements that contain job-related text
        const jobKeywords = [
          'job',
          'career',
          'position',
          'opening',
          'vacancy',
          'role',
        ];

        for (const keyword of jobKeywords) {
          const elements = $(`div:contains("${keyword}")`).filter(function () {
            // Only select elements that directly contain the text, not just descendants
            return (
              $(this).text().toLowerCase().includes(keyword) &&
              $(this).children().length > 0 &&
              $(this).children().length < 5
            ); // Likely a job card if it has a few children
          });

          if (elements.length > 0 && elements.length < 100) {
            // Avoid selecting too many elements
            jobElements = elements;
            usedSelector = `div:contains("${keyword}")`;
            break;
          }
        }
      }

      this.logger.log(
        `Found ${jobElements.length} job elements using selector: ${usedSelector}`,
      );

      // If we found job elements, extract the data
      for (let i = 0; i < jobElements.length; i++) {
        const el = jobElements[i];

        // Expanded selectors for job title
        const titleSelectors = [
          '.job-title',
          '.title',
          'h3',
          'h4',
          'h2',
          'a strong',
          '.position-title',
          'a h3',
          'a h4',
          'a h2',
          '.name',
          '.role',
          'span.title',
          'div.title',
          'div[class*="title"]',
          'span[class*="title"]',
          'strong',
          'b',
        ];

        let title = '';

        // Try to find the title
        for (const selector of titleSelectors) {
          const titleEl = $(el).find(selector).first();
          if (titleEl.length > 0) {
            title = titleEl.text().trim();
            break;
          }
        }

        // If no title found with selectors, try to extract from the element's text
        if (!title) {
          // Get all text nodes directly under this element
          const text = $(el)
            .contents()
            .filter(function () {
              return this.type === 'text';
            })
            .text()
            .trim();

          if (text && text.length < 100) {
            // Likely a title if it's short
            title = text;
          } else {
            // Try the first child with text
            const firstTextChild = $(el)
              .children()
              .filter(function () {
                return $(this).text().trim().length > 0;
              })
              .first();

            if (firstTextChild.length > 0) {
              title = firstTextChild.text().trim();
            }
          }
        }

        // Expanded selectors for location
        const locationSelectors = [
          '.location',
          '.job-location',
          '.meta .location',
          '.position-location',
          'span[class*="location"]',
          'div[class*="location"]',
          '.workplace',
          '.place',
          '.address',
          '.region',
          'span.location',
          'div.location',
          // Look for text patterns that might indicate location
          'span:contains("Location:")',
          'div:contains("Location:")',
        ];

        let location = '';

        // Try to find the location
        for (const selector of locationSelectors) {
          const locationEl = $(el).find(selector).first();
          if (locationEl.length > 0) {
            location = locationEl.text().trim();
            // If it contains "Location:", extract just the location part
            if (location.includes('Location:')) {
              location = location.split('Location:')[1].trim();
            }
            break;
          }
        }

        // Try to find the job URL
        let jobUrl = '';

        // First check if the element itself is an <a> tag
        if ($(el).is('a')) {
          jobUrl = $(el).attr('href') || '';
        } else {
          // Otherwise look for an <a> tag inside
          const linkEl = $(el).find('a').first();
          if (linkEl.length > 0) {
            jobUrl = linkEl.attr('href') || '';
          }
        }

        // Handle relative URLs
        if (jobUrl && !jobUrl.startsWith('http')) {
          try {
            const urlObj = new URL(url);
            if (jobUrl.startsWith('/')) {
              jobUrl = `${urlObj.origin}${jobUrl}`;
            } else {
              jobUrl = `${urlObj.origin}/${jobUrl}`;
            }
          } catch (error) {
            this.logger.error(`Error parsing URL: ${error.message}`);
          }
        }

        // Clean up the title and location
        if (title) {
          title = title.replace(/\s+/g, ' ').trim();
        }

        if (location) {
          location = location.replace(/\s+/g, ' ').trim();
        }

        // If we have a title and URL, create a job listing
        if (title && jobUrl) {
          const id = `${companyName}-${title}-${location}`
            .replace(/\s+/g, '-')
            .toLowerCase();

          // Check if job already exists
          const exists = await this.jobListingModel.findOne({ id }).exec();

          if (!exists) {
            const job = new this.jobListingModel({
              id,
              title,
              company: companyName,
              location: location || 'Remote/Unspecified',
              url: jobUrl,
              source: url,
              scrapedAt: new Date(),
            });

            await job.save();
            newJobs.push(job);
          }
        }
      }

      // If we didn't find any jobs, log the page structure to help debug
      if (newJobs.length === 0) {
        this.logger.log('No jobs found. Page structure analysis:');

        // Log some key elements that might help identify the structure
        this.logger.log(`Body classes: ${$('body').attr('class')}`);
        this.logger.log(
          `Main container: ${$('main').length > 0 ? 'Found' : 'Not found'}`,
        );
        this.logger.log(
          `Job-related text: ${$('body:contains("job")').length > 0 ? 'Found' : 'Not found'}`,
        );

        // Log all div elements with class names containing job-related terms
        const jobRelatedDivs = $(
          'div[class*="job"], div[class*="career"], div[class*="position"]',
        );
        this.logger.log(
          `Found ${jobRelatedDivs.length} divs with job-related class names`,
        );

        // Try to find any links that might be job listings
        const potentialJobLinks = $('a').filter(function () {
          const text = $(this).text().toLowerCase();
          return (
            text.includes('job') ||
            text.includes('career') ||
            text.includes('position') ||
            text.includes('opening')
          );
        });

        this.logger.log(
          `Found ${potentialJobLinks.length} potential job links`,
        );

        // Log a few examples of these links
        if (potentialJobLinks.length > 0) {
          this.logger.log('Sample job links:');
          potentialJobLinks.slice(0, 5).each((i, el) => {
            this.logger.log(
              `Link ${i + 1}: ${$(el).text().trim()} - ${$(el).attr('href')}`,
            );
          });
        }
      }

      this.logger.log(`Found ${newJobs.length} new jobs from ${companyName}`);
      return newJobs;
    } catch (error) {
      this.logger.error(`Error scraping ${companyName}: ${error.message}`);
      return [];
    }
  }
}
