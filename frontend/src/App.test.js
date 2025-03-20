import { render, screen } from '@testing-library/react';
import App from './App';

test('renders job listing collector heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Job Listing Collector/i);
  expect(headingElement).toBeInTheDocument();
});
