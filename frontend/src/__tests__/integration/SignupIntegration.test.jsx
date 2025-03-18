import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Signup from '../../components/Signup';
import { BrowserRouter } from 'react-router-dom';

// Mock fetch
global.fetch = jest.fn();

describe('Signup Integration', () => {
  beforeEach(() => {
    // Clear any previous responses
    global.fetch.mockClear();
  });

  it('successfully registers a new user', async () => {
    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'User successfully registered!' })
    });

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    // Fill in the form
    await userEvent.type(screen.getByPlaceholderText('Username'), 'newuser');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'securepass123');

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Verify API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'newuser',
          password: 'securepass123'
        })
      });
    });

    // Check for success message
    await waitFor(() => {
      expect(screen.getByText('User successfully registered!')).toBeInTheDocument();
    });
  });

  it('handles server errors gracefully', async () => {
    // Mock server error response
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    // Fill in the form
    await userEvent.type(screen.getByPlaceholderText('Username'), 'testuser');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'testpass');

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('validates input before submission', async () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    // Try to submit with empty fields
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Verify no API call was made
    expect(fetch).not.toHaveBeenCalled();
  });
}); 