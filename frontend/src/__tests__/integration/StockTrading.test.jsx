import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Explore from '@/components/Explore';
import TradeModal from '@/components/TradeModal';
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

describe('Stock Trading Integration', () => {
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

  test('complete stock trading flow', async () => {
    render(<Explore />);

    // Search for stock
    const searchInput = screen.getByPlaceholderText(/search by symbol/i);
    fireEvent.change(searchInput, { target: { value: 'AAPL' } });

    // Wait for stock to appear
    await waitFor(() => {
      expect(screen.getByText('Apple Inc')).toBeInTheDocument();
    });

    // Click stock to open trade modal
    fireEvent.click(screen.getByText('Apple Inc'));

    // Verify trade modal appears
    await waitFor(() => {
      expect(screen.getByTestId('trade-modal')).toBeInTheDocument();
    });

    // Execute trade
    const quantityInput = screen.getByTestId('quantity-input');
    fireEvent.change(quantityInput, { target: { value: '5' } });

    const buyButton = screen.getByTestId('buy-button');
    fireEvent.click(buyButton);

    // Verify trade success
    await waitFor(() => {
      expect(screen.getByText('Trade successful')).toBeInTheDocument();
    });
  });

  test('portfolio updates after trade', async () => {
    render(<Explore />);

    // Mock portfolio data
    supabase.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: {
              amt_bought: 5,
              total_spent: 750.00
            },
            error: null
          })
        })
      })
    }));

    // Search and trade stock
    const searchInput = screen.getByPlaceholderText(/search by symbol/i);
    fireEvent.change(searchInput, { target: { value: 'AAPL' } });

    await waitFor(() => {
      expect(screen.getByText('Apple Inc')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Apple Inc'));

    const quantityInput = screen.getByTestId('quantity-input');
    fireEvent.change(quantityInput, { target: { value: '5' } });

    const buyButton = screen.getByTestId('buy-button');
    fireEvent.click(buyButton);

    // Verify portfolio update
    await waitFor(() => {
      expect(screen.getByText('5 shares')).toBeInTheDocument();
    });
  });

  test('handles insufficient funds', async () => {
    // Mock low balance
    supabase.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: { wallet_amt: 100.00 },
            error: null
          })
        })
      })
    }));

    render(<Explore />);

    // Search and attempt trade
    const searchInput = screen.getByPlaceholderText(/search by symbol/i);
    fireEvent.change(searchInput, { target: { value: 'AAPL' } });

    await waitFor(() => {
      expect(screen.getByText('Apple Inc')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Apple Inc'));

    const quantityInput = screen.getByTestId('quantity-input');
    fireEvent.change(quantityInput, { target: { value: '10' } });

    const buyButton = screen.getByTestId('buy-button');
    fireEvent.click(buyButton);

    // Verify error message
    await waitFor(() => {
      expect(screen.getByText(/insufficient funds/i)).toBeInTheDocument();
    });
  });
}); 