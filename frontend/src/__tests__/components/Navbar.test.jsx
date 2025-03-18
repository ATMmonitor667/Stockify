import { render, screen } from '@testing-library/react'
import Navbar from '@/components/Navbar'

describe('Navbar Component', () => {
  // Test expected behavior
  test('renders navigation links correctly', () => {
    render(<Navbar />)
    
    // Test navigation links
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('AI Help')).toBeInTheDocument()
  })

  // Test logo
  test('renders Stockify logo with correct link', () => {
    render(<Navbar />)
    const logo = screen.getByText('Stockify')
    expect(logo).toBeInTheDocument()
    expect(logo.closest('a')).toHaveAttribute('href', '/')
  })

  // Test authentication buttons
  test('renders authentication buttons', () => {
    render(<Navbar />)
    
    const loginButton = screen.getByRole('button', { name: 'Login' })
    const signUpButton = screen.getByRole('button', { name: 'Sign Up' })
    
    expect(loginButton).toBeInTheDocument()
    expect(signUpButton).toBeInTheDocument()
  })

  // Test link attributes
  test('navigation links have correct href attributes', () => {
    render(<Navbar />)
    
    expect(screen.getByText('Features').closest('a')).toHaveAttribute('href', '#features')
    expect(screen.getByText('About').closest('a')).toHaveAttribute('href', '#about')
    expect(screen.getByText('AI Help').closest('a')).toHaveAttribute('href', '#ai-help')
  })

  // Test AI Help emoji
  test('renders AI Help with emoji', () => {
    render(<Navbar />)
    const aiHelpLink = screen.getByText('AI Help').closest('a')
    expect(aiHelpLink).toContainHTML('🤖')
  })
}) 