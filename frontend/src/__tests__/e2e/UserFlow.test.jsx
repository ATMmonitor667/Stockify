import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useGlobalUser } from '@/config/UserContext';
import App from '../../pages/_app';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

// Mock UserContext
jest.mock('@/config/UserContext', () => ({
  useGlobalUser: jest.fn()
}));

// Mock fetch
global.fetch = jest.fn();

describe('User Flow', () => {
  const mockUser = {
    username: 'testuser',
    email: 'test@example.com',
    wallet: {
      balance: 1000
    }
  };

  beforeEach(() => {
    useGlobalUser.mockReturnValue(mockUser);
    fetch.mockClear();
  });

  test('user can sign in', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'test-token' })
    });

    render(<App />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const signInButton = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(useRouter().push).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('user can search stocks', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { symbol: 'AAPL', name: 'Apple Inc', price: 150.00 }
        ]
      })
    });

    render(<App />);

    const searchInput = screen.getByPlaceholderText('Search stocks...');
    fireEvent.change(searchInput, { target: { value: 'AAPL' } });

    await waitFor(() => {
      expect(screen.getByText('Apple Inc')).toBeInTheDocument();
    });
  });
}); 