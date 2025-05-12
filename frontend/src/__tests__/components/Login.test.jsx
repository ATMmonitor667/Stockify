import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Login from '@/components/Login'
import { supabase } from '@/config/supabaseClient'
import { useRouter } from 'next/navigation'

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    form: ({ children, ...props }) => <form {...props}>{children}</form>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>
  }
}))

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }) => <a href={href} data-testid={href === '/' ? 'back-button' : undefined}>{children}</a>
}))

// Mock the Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock the Supabase client
jest.mock('@/config/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn()
    }
  }
}))

// Mock console.error to prevent test output pollution
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('Login Component', () => {
  const mockRouter = {
    push: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useRouter.mockReturnValue(mockRouter)
  })

  it('renders the login form correctly', () => {
    render(<Login />)
    
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Log in/i })).toBeInTheDocument()
    expect(screen.getByText(/Don't have an account\?/i)).toBeInTheDocument()
    expect(screen.getByText('Sign up')).toBeInTheDocument()
  })

  it('updates form values on input change', () => {
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/Email Address/i)
    const passwordInput = screen.getByLabelText(/Password/i)
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    expect(emailInput.value).toBe('test@example.com')
    expect(passwordInput.value).toBe('password123')
  })

  it('handles successful login and redirects', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'user123' } },
      error: null
    })
    
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/Email Address/i)
    const passwordInput = screen.getByLabelText(/Password/i)
    const loginButton = screen.getByRole('button', { name: /Log in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(loginButton)
    
    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })
  })

  it('displays error message when login fails', async () => {
    const errorMessage = 'Invalid login credentials'
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: errorMessage }
    })
    
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/Email Address/i)
    const passwordInput = screen.getByLabelText(/Password/i)
    const loginButton = screen.getByRole('button', { name: /Log in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(loginButton)
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      expect(mockRouter.push).not.toHaveBeenCalled()
    })
  })

  it('handles unexpected errors during login', async () => {
    // Use mockImplementation instead of mockRejectedValue
    supabase.auth.signInWithPassword.mockImplementation(() => {
      throw new Error('Network error')
    })
    
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/Email Address/i)
    const passwordInput = screen.getByLabelText(/Password/i)
    const loginButton = screen.getByRole('button', { name: /Log in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(loginButton)
    
    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
      expect(mockRouter.push).not.toHaveBeenCalled()
    })
  })

  it('shows loading state while submitting', async () => {
    // Create a delayed promise resolution
    supabase.auth.signInWithPassword.mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ data: { user: { id: 'user123' } }, error: null })
        }, 100)
      })
    })
    
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/Email Address/i)
    const passwordInput = screen.getByLabelText(/Password/i)
    const loginButton = screen.getByRole('button', { name: /Log in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(loginButton)
    
    // Verify button text changes to loading state
    expect(loginButton).toHaveTextContent('Logging in...')
    
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })
  })

  it('navigates to signup page when signup link is clicked', () => {
    render(<Login />)
    
    const signupLink = screen.getByText('Sign up')
    fireEvent.click(signupLink)
    
    // Since actual navigation won't happen in tests, we just check the href
    expect(signupLink.closest('a')).toHaveAttribute('href', '/signup')
  })

  it('navigates back to home when back button is clicked', () => {
    render(<Login />)
    
    // Find the back arrow button using the data-testid
    const backButton = screen.getByTestId('back-button')
    expect(backButton).toHaveAttribute('href', '/')
  })
}) 