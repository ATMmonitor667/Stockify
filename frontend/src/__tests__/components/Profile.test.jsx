import { render, screen, waitFor, act } from '@testing-library/react';
import Profile from '@/components/Profile';
import { useGlobalUser } from '@/config/UserContext';

// Mock the useGlobalUser hook
jest.mock('@/config/UserContext', () => ({
  useGlobalUser: jest.fn()
}));

// Improved supabase mock to support .from().select().eq().single() chain
jest.mock('@/config/supabaseClient', () => {
  const single = jest.fn().mockResolvedValue({
    data: {
      user_name: 'testuser',
      wallet_amt: 1000,
      created_at: '2024-01-01T00:00:00.000Z'
    },
    error: null
  });
  const eq = jest.fn(() => ({ single }));
  const select = jest.fn(() => ({ eq }));
  return {
    supabase: {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: '123', email: 'test@example.com' } }
        })
      },
      from: jest.fn(() => ({ select }))
    }
  };
});

// Mock the finnhub client
jest.mock('@/config/finnhubClient', () => ({
  getStockQuote: jest.fn().mockResolvedValue({ c: 175, d: 2.5, dp: 1.5 }),
  getCompanyProfile: jest.fn().mockResolvedValue({ name: 'Apple Inc.' }),
  searchStocks: jest.fn().mockResolvedValue([])
}));

describe('Profile Component', () => {
  const mockUser = {
    username: 'testuser',
    email: 'test@example.com',
    bio: 'Test bio',
    wallet: 1000,
    id: '123'
  };

  const mockPortfolio = [
    {
      symbol: 'AAPL',
      quote: {
        c: 175,
        d: 2.5,
        dp: 1.5
      },
      profile: {
        name: 'Apple Inc.'
      },
      amt_bought: 10,
      total_spent: 1500,
      stock_info: {
        tick: 'AAPL',
        name: 'Apple Inc.'
      }
    }
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock the useGlobalUser hook
    useGlobalUser.mockReturnValue(mockUser);

    // Mock fetch for stock data
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPortfolio)
      })
    );
  });

  test('renders user information', async () => {
    await act(async () => {
      render(<Profile />);
    });

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });

  test('shows loading state initially', async () => {
    await act(async () => {
      render(<Profile />);
    });

    const loadingSpinner = screen.getByTestId('loading-spinner');
    expect(loadingSpinner).toBeInTheDocument();
  });

  test('shows error message on fetch failure', async () => {
    // Mock fetch to reject
    global.fetch = jest.fn(() => Promise.reject(new Error('API Error')));

    await act(async () => {
      render(<Profile />);
    });

    await waitFor(() => {
      expect(screen.getByText(/error loading profile/i)).toBeInTheDocument();
    });
  });

  test('displays portfolio information', async () => {
    await act(async () => {
      render(<Profile />);
    });

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    });
  });

  test('handles sign out', async () => {
    const mockSignOut = jest.fn();
    useGlobalUser.mockReturnValue({ ...mockUser, signOut: mockSignOut });

    await act(async () => {
      render(<Profile />);
    });

    const signOutButton = screen.getByRole('button', { name: /sign in/i });
    await act(async () => {
      signOutButton.click();
    });

    expect(window.location.href).toContain('/login');
  });

  test('displays trade history', async () => {
    const mockTradeHistory = [
      {
        id: 1,
        created_at: '2024-01-01T00:00:00.000Z',
        stock: { tick: 'AAPL', name: 'Apple Inc.' },
        type: 'buy',
        quantity: 10,
        price_per_share: 150,
        total_amount: 1500
      }
    ];

    // Mock supabase response for trade history
    const { supabase } = require('@/config/supabaseClient');
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockTradeHistory, error: null })
    }));

    await act(async () => {
      render(<Profile />);
    });

    await waitFor(() => {
      expect(screen.getByText('Trade History')).toBeInTheDocument();
    });
  });

  test('displays user posts', async () => {
    const mockPosts = [
      {
        id: 1,
        body: 'Test post',
        created_at: '2024-01-01T00:00:00.000Z',
        author: '123'
      }
    ];

    // Mock supabase response for posts
    const { supabase } = require('@/config/supabaseClient');
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockPosts, error: null })
    }));

    await act(async () => {
      render(<Profile />);
    });

    // Click on posts tab
    const postsTab = screen.getByText('Posts');
    await act(async () => {
      postsTab.click();
    });

    await waitFor(() => {
      expect(screen.getByText('Test post')).toBeInTheDocument();
    });
  });
}); 