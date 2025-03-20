import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.getJobs();
      setJobs(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch job listings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // Refresh every minute
    const interval = setInterval(fetchJobs, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading && jobs.length === 0) {
    return <div className="loading">Loading job listings...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="job-list">
      <h2>Job Listings ({jobs.length})</h2>
      <button onClick={fetchJobs} className="refresh-btn">
        Refresh
      </button>

      {jobs.length === 0 ? (
        <p>No job listings found. Add some career pages to get started.</p>
      ) : (
        <div className="jobs-container">
          {jobs.map((job) => (
            <div key={job.id} className="job-card">
              <h3>{job.title}</h3>
              <div className="job-meta">
                <span className="company">{job.company}</span>
                <span className="location">{job.location}</span>
              </div>
              <div className="job-date">
                Found: {new Date(job.scrapedAt).toLocaleString()}
              </div>
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="view-job"
              >
                View Job
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobList;
