import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const CareerPages = () => {
  const [pages, setPages] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scraping, setScraping] = useState(false);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await api.getCareerPages();
      setPages(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch career pages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleAddPage = async (e) => {
    e.preventDefault();
    if (!newUrl || !newName) return;

    try {
      await api.addCareerPage(newUrl, newName);
      setNewUrl('');
      setNewName('');
      fetchPages();
    } catch (err) {
      setError('Failed to add career page');
      console.error(err);
    }
  };

  const handleRemovePage = async (url) => {
    try {
      await api.removeCareerPage(url);
      fetchPages();
    } catch (err) {
      setError('Failed to remove career page');
      console.error(err);
    }
  };

  const handleScrapeAll = async () => {
    try {
      setScraping(true);
      await api.triggerScrape();
      setScraping(false);
    } catch (err) {
      setError('Failed to trigger scraping');
      console.error(err);
      setScraping(false);
    }
  };

  if (loading && pages.length === 0) {
    return <div className="loading">Loading career pages...</div>;
  }

  return (
    <div className="career-pages">
      <h2>Career Pages</h2>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleAddPage} className="add-page-form">
        <div className="form-group">
          <input
            type="text"
            placeholder="Company Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="url"
            placeholder="Career Page URL"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Career Page</button>
      </form>

      <div className="actions">
        <button
          onClick={handleScrapeAll}
          disabled={scraping || pages.length === 0}
          className="scrape-btn"
        >
          {scraping ? 'Scraping...' : 'Scrape All Pages Now'}
        </button>
      </div>

      {pages.length === 0 ? (
        <p>No career pages added yet. Add some above to get started.</p>
      ) : (
        <div className="pages-list">
          {pages.map((page) => (
            <div key={page.url} className="page-item">
              <div className="page-info">
                <h3>{page.name}</h3>
                <a href={page.url} target="_blank" rel="noopener noreferrer">
                  {page.url}
                </a>
              </div>
              <button
                onClick={() => handleRemovePage(page.url)}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CareerPages;
