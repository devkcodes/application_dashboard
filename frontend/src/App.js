import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import JobList from './components/JobList';
import CareerPages from './components/CareerPages';
import Settings from './components/Settings';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Job Listing Collector</h1>
          <nav>
            <Link to="/">Jobs</Link>
            <Link to="/pages">Career Pages</Link>
            <Link to="/settings">Settings</Link>
          </nav>
        </header>

        <main className="app-content">
          <Routes>
            <Route path="/" element={<JobList />} />
            <Route path="/pages" element={<CareerPages />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>Job Listing Collector &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
