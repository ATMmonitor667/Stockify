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
}); 