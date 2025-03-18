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
      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:5001/signup', {
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

  // NEW TEST: Handles duplicate username
  it('handles duplicate username error from backend', async () => {
    // Mock backend response for duplicate username
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Username already exists' })
    });

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    // Fill in the form with an existing username
    await userEvent.type(screen.getByPlaceholderText('Username'), 'existinguser');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Verify API call was made
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:5001/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'existinguser',
          password: 'password123'
        })
      });
    });

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Username already exists')).toBeInTheDocument();
    });
  });

  // NEW TEST: Handles malformed request
  it('handles malformed request error from backend', async () => {
    // Mock backend response for malformed request
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid request format' })
    });

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    // Fill in the form with special characters
    await userEvent.type(screen.getByPlaceholderText('Username'), 'user@#$%');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'pass');

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Invalid request format')).toBeInTheDocument();
    });
  });

  // NEW TEST: Handles database errors
  it('handles database errors from backend', async () => {
    // Mock backend response for database error
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Database error occurred' })
    });

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    // Fill in the form
    await userEvent.type(screen.getByPlaceholderText('Username'), 'newuser');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Database error occurred')).toBeInTheDocument();
    });
  });

  // NEW TEST: Verifies password hashing integration
  it('sends password in correct format for hashing', async () => {
    // Mock successful response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'User successfully registered!' })
    });

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    const password = 'MySecurePass123!';
    
    // Fill in the form with a password that needs to be hashed
    await userEvent.type(screen.getByPlaceholderText('Username'), 'newuser');
    await userEvent.type(screen.getByPlaceholderText('Password'), password);

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Verify the password is sent in plain text for backend hashing
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:5001/signup',
        expect.objectContaining({
          body: JSON.stringify({
            username: 'newuser',
            password: password // Password should be sent as is for backend hashing
          })
        })
      );
    });
  });
}); 