import { render, screen, fireEvent } from '@testing-library/react'
import Signup from '@/components/Signup'
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