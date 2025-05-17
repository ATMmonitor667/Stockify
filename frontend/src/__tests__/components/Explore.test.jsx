import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Explore from '@/components/Explore';
import { supabase } from '@/config/supabaseClient';
import { getStockQuote, getCompanyProfile, searchStocks } from '@/config/finnhubClient';

// Mock the dependencies
jest.mock('@/config/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn()
    },
    from: jest.fn()
  }
}));

jest.mock('@/config/finnhubClient', () => ({
  getStockQuote: jest.fn(),
  getCompanyProfile: jest.fn(),
  searchStocks: jest.fn()
}));

describe('Explore Component', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com'
  };

  const mockStockData = {
    quote: {
      c: 150.00,
      d: 2.50,
      dp: 1.67,
      o: 148.00,
      h: 152.00
    },
    profile: {
      name: 'Apple Inc',
      ticker: 'AAPL'
    }
  };

  const mockPortfolioData = {
    AAPL: {
      quantity: 5,
      totalSpent: 750.00
    }
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock Supabase auth
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } }
    });

    // Mock user profile data
    supabase.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: { wallet_amt: 10000.00 },
            error: null
          })
        })
      })
    }));

    // Mock stock data fetching
    getStockQuote.mockResolvedValue(mockStockData.quote);
    getCompanyProfile.mockResolvedValue(mockStockData.profile);
    searchStocks.mockResolvedValue([{
      symbol: 'AAPL',
      description: 'Apple Inc',
      type: 'Common Stock'
    }]);
  });

  test('renders explore page with user balance', async () => {
    render(<Explore />);
    
    await waitFor(() => {
      expect(screen.getByText('Explore Stocks')).toBeInTheDocument();
      expect(screen.getByText(/Balance:/)).toBeInTheDocument();
    });
  });

  test('handles stock search', async () => {
    render(<Explore />);
    
    const searchInput = screen.getByPlaceholderText(/search by symbol/i);
    fireEvent.change(searchInput, { target: { value: 'AAPL' } });
    
    await waitFor(() => {
      expect(screen.getByText('Apple Inc')).toBeInTheDocument();
    });
  });

  test('displays market status', async () => {
    render(<Explore />);
    
    await waitFor(() => {
      const marketStatus = screen.getByText(/Market (Open|Closed)/);
      expect(marketStatus).toBeInTheDocument();
    });
  });

  test('handles trade modal interaction', async () => {
    render(<Explore />);
    
    // Search for a stock
    const searchInput = screen.getByPlaceholderText(/search by symbol/i);
    fireEvent.change(searchInput, { target: { value: 'AAPL' } });
    
    // Wait for stock to appear and click it
    await waitFor(() => {
      expect(screen.getByText('Apple Inc')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Apple Inc'));
    
    // Verify trade modal appears
    await waitFor(() => {
      expect(screen.getByTestId('trade-modal')).toBeInTheDocument();
    });
  });

  test('displays error message on failed stock search', async () => {
    // Mock failed stock search
    getStockQuote.mockRejectedValue(new Error('Failed to fetch stock data'));
    
    render(<Explore />);
    
    const searchInput = screen.getByPlaceholderText(/search by symbol/i);
    fireEvent.change(searchInput, { target: { value: 'INVALID' } });
    
    await waitFor(() => {
      expect(screen.getByText(/error searching stock/i)).toBeInTheDocument();
    });
  });

  test('displays featured stocks', async () => {
    render(<Explore />);
    
    await waitFor(() => {
      expect(screen.getByText('Featured Stocks')).toBeInTheDocument();
    });
  });

  test('displays trending stocks', async () => {
    render(<Explore />);
    
    await waitFor(() => {
      expect(screen.getByText('Trending Stocks')).toBeInTheDocument();
    });
  });

  test('handles stock card click', async () => {
    render(<Explore />);
    
    // Wait for featured stocks to load
    await waitFor(() => {
      expect(screen.getByText('Featured Stocks')).toBeInTheDocument();
    });
    
    // Click on a stock card
    const stockCard = screen.getByText('Apple Inc');
    fireEvent.click(stockCard);
    
    // Verify trade modal appears
    await waitFor(() => {
      expect(screen.getByTestId('trade-modal')).toBeInTheDocument();
    });
  });

  test('displays portfolio section', async () => {
    // Mock portfolio data
    supabase.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: mockPortfolioData,
            error: null
          })
        })
      })
    }));

    render(<Explore />);
    
    await waitFor(() => {
      expect(screen.getByText('My Stock List')).toBeInTheDocument();
    });
  });

  test('handles search suggestions', async () => {
    render(<Explore />);
    
    const searchInput = screen.getByPlaceholderText(/search by symbol/i);
    fireEvent.change(searchInput, { target: { value: 'App' } });
    
    await waitFor(() => {
      expect(screen.getByText('Apple Inc')).toBeInTheDocument();
    });
  });

  test('handles empty search results', async () => {
    // Mock empty search results
    searchStocks.mockResolvedValue([]);
    
    render(<Explore />);
    
    const searchInput = screen.getByPlaceholderText(/search by symbol/i);
    fireEvent.change(searchInput, { target: { value: 'NONEXISTENT' } });
    
    await waitFor(() => {
      expect(screen.getByText(/no matching stocks found/i)).toBeInTheDocument();
    });
  });

  test('handles network error during stock data fetch', async () => {
    // Mock network error
    getStockQuote.mockRejectedValue(new Error('Network error'));
    
    render(<Explore />);
    
    const searchInput = screen.getByPlaceholderText(/search by symbol/i);
    fireEvent.change(searchInput, { target: { value: 'AAPL' } });
    
    await waitFor(() => {
      expect(screen.getByText(/error loading stock data/i)).toBeInTheDocument();
    });
  });

  test('handles popular search chips', async () => {
    render(<Explore />);
    
    // Click on a popular search chip
    const popularChip = screen.getByText('AAPL');
    fireEvent.click(popularChip);
    
    await waitFor(() => {
      expect(screen.getByText('Apple Inc')).toBeInTheDocument();
    });
  });

  test('handles stock price formatting', async () => {
    render(<Explore />);
    
    await waitFor(() => {
      const priceElement = screen.getByText(/\$150\.00/);
      expect(priceElement).toBeInTheDocument();
    });
  });

  test('handles stock price change display', async () => {
    render(<Explore />);
    
    await waitFor(() => {
      const changeElement = screen.getByText(/\+1\.67%/);
      expect(changeElement).toBeInTheDocument();
    });
  });

  test('handles market closed state', async () => {
    // Mock market closed state
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T20:00:00Z')); // Market closed time
    
    render(<Explore />);
    
    await waitFor(() => {
      expect(screen.getByText('Market Closed')).toBeInTheDocument();
    });
    
    jest.useRealTimers();
  });
}); 