import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const Settings = () => {
  const [interval, setInterval] = useState('1h');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInterval = async () => {
      try {
        setLoading(true);
        const response = await api.getInterval();
        setInterval(response.data.interval);
        setError(null);
      } catch (err) {
        setError('Failed to fetch settings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInterval();
  }, []);

  const handleIntervalChange = async (newInterval) => {
    try {
      await api.setInterval(newInterval);
      setInterval(newInterval);
    } catch (err) {
      setError('Failed to update interval');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <div className="settings">
      <h2>Settings</h2>

      {error && <div className="error">{error}</div>}

      <div className="setting-group">
        <h3>Scraping Interval</h3>
        <div className="interval-options">
          <button
            className={interval === '1h' ? 'active' : ''}
            onClick={() => handleIntervalChange('1h')}
          >
            Every Hour
          </button>
          <button
            className={interval === '6h' ? 'active' : ''}
            onClick={() => handleIntervalChange('6h')}
          >
            Every 6 Hours
          </button>
        </div>
        <p className="setting-help">
          Job listings will be automatically scraped at this interval.
        </p>
      </div>
    </div>
  );
};

export default Settings;
