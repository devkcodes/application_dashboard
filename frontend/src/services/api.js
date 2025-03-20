import axios from 'axios';

const API_URL = 'http://localhost:4000';

export const api = {
  // Job listings
  getJobs: () => axios.get(`${API_URL}/scraper/jobs`),

  // Career pages
  getCareerPages: () => axios.get(`${API_URL}/scraper/pages`),
  addCareerPage: (url, name) =>
    axios.post(`${API_URL}/scraper/pages`, { url, name }),
  removeCareerPage: (url) =>
    axios.delete(`${API_URL}/scraper/pages/${encodeURIComponent(url)}`),

  // Manual scraping
  triggerScrape: () => axios.post(`${API_URL}/scraper/scrape`),

  // Scheduler
  getInterval: () => axios.get(`${API_URL}/scheduler/interval`),
  setInterval: (interval) =>
    axios.post(`${API_URL}/scheduler/interval`, { interval }),
};
