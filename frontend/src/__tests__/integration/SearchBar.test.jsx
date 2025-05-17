import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchBar from '../../components/SearchBar';

// Mock fetch
global.fetch = jest.fn();

describe('SearchBar Integration', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
    fetch.mockClear();
  });

  test('performs search and displays results', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { symbol: 'AAPL', name: 'Apple Inc', price: 150.00 }
        ]
      })
    });

    render(<SearchBar onSelect={mockOnSelect} />);
    const searchInput = screen.getByPlaceholderText('Search stocks...');
    fireEvent.change(searchInput, { target: { value: 'AAPL' } });

    await waitFor(() => {
      expect(screen.getByText('Apple Inc')).toBeInTheDocument();
    });
  });

  test('handles search error', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch'));
    render(<SearchBar onSelect={mockOnSelect} />);
    
    const searchInput = screen.getByPlaceholderText('Search stocks...');
    fireEvent.change(searchInput, { target: { value: 'AAPL' } });

    await waitFor(() => {
      expect(screen.getByText('Error searching stocks')).toBeInTheDocument();
    });
  });
}); 