import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Signup from '@/components/Signup'
import { supabase } from '@/config/supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'

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

// Mock the Next.js router and search params
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn()
}))

// Mock the Supabase client
jest.mock('@/config/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: jest.fn()
    },
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ error: null })
    }))
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

describe('Signup Component', () => {
  const mockRouter = {
    push: jest.fn()
  }
  
  const mockSearchParams = {
    get: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useRouter.mockReturnValue(mockRouter)
    useSearchParams.mockReturnValue(mockSearchParams)
    mockSearchParams.get.mockImplementation(param => {
      if (param === 'redirect') return '/'
      return null
    })
  })

  it('renders the signup form correctly', () => {
    render(<Signup />)
    
    expect(screen.getByText('Create your account')).toBeInTheDocument()
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/User Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create account/i })).toBeInTheDocument()
    expect(screen.getByText(/Already have an account\?/i)).toBeInTheDocument()
    expect(screen.getByText('Sign in')).toBeInTheDocument()
  })

  it('updates form values on input change', () => {
    render(<Signup />)
    
    const emailInput = screen.getByLabelText(/Email Address/i)
    const usernameInput = screen.getByLabelText(/User Name/i)
    const passwordInput = screen.getByLabelText(/^Password$/i)
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i)
    
    // Change inputs one at a time and test after each change
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    expect(emailInput.value).toBe('test@example.com')
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    expect(usernameInput.value).toBe('testuser')
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    expect(passwordInput.value).toBe('password123')
    
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    expect(confirmPasswordInput.value).toBe('password123')
  })

  it('shows password mismatch error in the UI', () => {
    render(<Signup />)
    
    const passwordInput = screen.getByLabelText(/^Password$/i)
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i)
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } })
    
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
  })

  it('prevents form submission when passwords do not match', async () => {
    render(<Signup />)
    
    const emailInput = screen.getByLabelText(/Email Address/i)
    const usernameInput = screen.getByLabelText(/User Name/i)
    const passwordInput = screen.getByLabelText(/^Password$/i)
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i)
    const signupButton = screen.getByRole('button', { name: /Create account/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } })
    
    fireEvent.submit(signupButton.closest('form'))
    
    expect(screen.getByRole('alert').textContent).toContain('Passwords do not match')
    expect(supabase.auth.signUp).not.toHaveBeenCalled()
  })

  it('handles successful signup and profile creation', async () => {
    const mockUser = { id: 'user123' }
    
    // Reset mocks first
    jest.clearAllMocks()
    
    // Mock successful signup
    supabase.auth.signUp.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })
    
    // Mock successful profile creation
    const mockInsert = jest.fn().mockResolvedValue({ error: null })
    supabase.from.mockReturnValue({
      insert: mockInsert
    })
    
    render(<Signup />)
    
    const emailInput = screen.getByLabelText(/Email Address/i)
    const usernameInput = screen.getByLabelText(/User Name/i)
    const passwordInput = screen.getByLabelText(/^Password$/i)
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i)
    const signupButton = screen.getByRole('button', { name: /Create account/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    
    fireEvent.submit(signupButton.closest('form'))
    
    // Check that the signup function was called
    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalled()
    })
    
    // Check that the profile creation function was called
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('profiles')
      expect(mockInsert).toHaveBeenCalled()
    })
    
    // Verify success message is displayed
    await waitFor(() => {
      const successMessage = screen.getByText(/Verification email sent/i)
      expect(successMessage).toBeInTheDocument()
    })
  })

  it('displays error message when signup fails', async () => {
    const errorMessage = 'Email already registered'
    supabase.auth.signUp.mockResolvedValue({
      data: null,
      error: { message: errorMessage }
    })
    
    render(<Signup />)
    
    const emailInput = screen.getByLabelText(/Email Address/i)
    const usernameInput = screen.getByLabelText(/User Name/i)
    const passwordInput = screen.getByLabelText(/^Password$/i)
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i)
    const signupButton = screen.getByRole('button', { name: /Create account/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    
    fireEvent.submit(signupButton.closest('form'))
    
    await waitFor(() => {
      const errorAlert = screen.getByText(errorMessage)
      expect(errorAlert).toBeInTheDocument()
    })
  })

  it('handles unexpected errors during signup', async () => {
    // Use mockImplementation to throw an error
    supabase.auth.signUp.mockImplementation(() => {
      throw new Error('Network error')
    })
    
    render(<Signup />)
    
    const emailInput = screen.getByLabelText(/Email Address/i)
    const usernameInput = screen.getByLabelText(/User Name/i)
    const passwordInput = screen.getByLabelText(/^Password$/i)
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i)
    const signupButton = screen.getByRole('button', { name: /Create account/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    
    fireEvent.submit(signupButton.closest('form'))
    
    await waitFor(() => {
      const errorAlert = screen.getByText('An unexpected error occurred')
      expect(errorAlert).toBeInTheDocument()
    })
  })

  it('displays success message when profile creation fails but signup succeeds', async () => {
    const mockUser = { id: 'user123' }
    
    supabase.auth.signUp.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })
    
    // Mock profile creation error
    supabase.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: { message: 'Profile creation failed' } })
    })
    
    render(<Signup />)
    
    const emailInput = screen.getByLabelText(/Email Address/i)
    const usernameInput = screen.getByLabelText(/User Name/i)
    const passwordInput = screen.getByLabelText(/^Password$/i)
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i)
    const signupButton = screen.getByRole('button', { name: /Create account/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    
    fireEvent.submit(signupButton.closest('form'))
    
    await waitFor(() => {
      const successMessage = screen.getByText(/Verification email sent/i)
      expect(successMessage).toBeInTheDocument()
    })
    
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Error creating profile'), expect.any(String))
  })

  it('shows loading state during form submission', async () => {
    // Create a delayed promise to test loading state
    supabase.auth.signUp.mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            data: { user: { id: 'user123' } },
            error: null
          })
        }, 100)
      })
    })
    
    render(<Signup />)
    
    const emailInput = screen.getByLabelText(/Email Address/i)
    const usernameInput = screen.getByLabelText(/User Name/i)
    const passwordInput = screen.getByLabelText(/^Password$/i)
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i)
    const signupButton = screen.getByRole('button', { name: /Create account/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    
    fireEvent.submit(signupButton.closest('form'))
    
    expect(signupButton).toBeDisabled()
    expect(signupButton).toHaveTextContent(/Creating account/i)
  })

  it('navigates to login page when sign in link is clicked', () => {
    mockSearchParams.get.mockImplementation(param => {
      if (param === 'redirect') return '/posts'
      return null
    })
    
    render(<Signup />)
    
    const signinLink = screen.getByText('Sign in')
    
    // Since actual navigation won't happen in tests, we just check the href
    expect(signinLink.closest('a')).toHaveAttribute('href', '/login?redirect=/posts')
  })

  it('navigates back to home when back button is clicked', () => {
    render(<Signup />)
    
    // Find the back arrow button using data-testid
    const backButton = screen.getByTestId('back-button')
    expect(backButton).toHaveAttribute('href', '/')
  })
}) 