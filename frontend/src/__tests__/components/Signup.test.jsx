import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Signup from '../../components/Signup';

// Mock fetch
global.fetch = jest.fn();

describe('Signup Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  // Test 1: Component renders correctly
  it('renders signup form with all elements', () => {
    render(<Signup />);
    
    // Check for main elements
    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  // Test 2: Form input handling
  it('updates input values when user types', async () => {
    render(<Signup />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(passwordInput, 'testpass');

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('testpass');
  });

  // Test 3: Successful signup
  it('handles successful signup', async () => {
    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'User successfully registered!' })
    });

    render(<Signup />);
    
    // Fill in the form
    await userEvent.type(screen.getByPlaceholderText('Username'), 'testuser');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'testpass');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Check for success message
    await waitFor(() => {
      expect(screen.getByText('User successfully registered!')).toBeInTheDocument();
    });
  });

  // Test 4: Error handling
  it('displays error message on failed signup', async () => {
    // Mock failed API response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Username already exists' })
    });

    render(<Signup />);
    
    // Fill in the form
    await userEvent.type(screen.getByPlaceholderText('Username'), 'existinguser');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'testpass');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Username already exists')).toBeInTheDocument();
    });
  });

  // Test 5: Input validation
  it('requires both username and password fields', async () => {
    render(<Signup />);
    
    // Try to submit without filling in fields
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Check that fetch was not called
    expect(global.fetch).not.toHaveBeenCalled();
  });

  // NEW TEST 6: Network error handling
  it('handles network errors gracefully', async () => {
    // Mock network error
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<Signup />);
    
    await userEvent.type(screen.getByPlaceholderText('Username'), 'testuser');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'testpass');
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  // NEW TEST 7: API error without specific message
  it('handles API errors without specific message', async () => {
    // Mock API error without specific message
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({})
    });

    render(<Signup />);
    
    await userEvent.type(screen.getByPlaceholderText('Username'), 'testuser');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'testpass');
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  // NEW TEST 8: Clear error message on new submission
  it('clears error message when form is submitted again', async () => {
    // First, trigger an error
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Initial error' })
    });

    render(<Signup />);
    
    await userEvent.type(screen.getByPlaceholderText('Username'), 'testuser');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'testpass');
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Initial error')).toBeInTheDocument();
    });

    // Mock successful response for second attempt
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Success' })
    });

    // Submit form again
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Verify error message is cleared
    await waitFor(() => {
      expect(screen.queryByText('Initial error')).not.toBeInTheDocument();
    });
  });
}); 