import { render, screen } from '@testing-library/react'
import Footer from '@/components/Footer'

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  }
}))

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }) => <a href={href}>{children}</a>
}))

describe('Footer Component', () => {
  beforeEach(() => {
    // Mock Date to ensure consistent year in copyright text
    const mockDate = new Date('2025-01-01');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  })

  afterEach(() => {
    jest.restoreAllMocks();
  })

  it('renders the footer title and slogan', () => {
    render(<Footer />)
    
    expect(screen.getByText('Stockify')).toBeInTheDocument()
    expect(screen.getByText('Making stock trading accessible and efficient for everyone.')).toBeInTheDocument()
  })

  it('displays a copyright text with the year', () => {
    render(<Footer />)
    
    // Use regex to match the copyright text regardless of the year
    const yearRegex = new RegExp(`© \\d{4} Stockify. All rights reserved.`);
    const copyrightElement = screen.getByText(yearRegex);
    expect(copyrightElement).toBeInTheDocument();
    
    // Verify that the current year is in the text
    const currentYear = new Date().getFullYear().toString();
    expect(copyrightElement.textContent).toContain(currentYear);
  })

  it('renders all navigation section headings', () => {
    render(<Footer />)
    
    expect(screen.getByText('Product')).toBeInTheDocument()
    expect(screen.getByText('Company')).toBeInTheDocument()
    expect(screen.getByText('Legal')).toBeInTheDocument()
  })

  it('contains all the expected product links', () => {
    render(<Footer />)
    
    const featuresLink = screen.getByText('Features')
    const pricingLink = screen.getByText('Pricing')
    
    expect(featuresLink).toBeInTheDocument()
    expect(featuresLink.closest('a')).toHaveAttribute('href', '#features')
    
    expect(pricingLink).toBeInTheDocument()
    expect(pricingLink.closest('a')).toHaveAttribute('href', '#pricing')
  })

  it('contains all the expected company links', () => {
    render(<Footer />)
    
    const aboutLink = screen.getByText('About Us')
    const careersLink = screen.getByText('Careers')
    const contactLink = screen.getByText('Contact')
    
    expect(aboutLink).toBeInTheDocument()
    expect(aboutLink.closest('a')).toHaveAttribute('href', '/about')
    
    expect(careersLink).toBeInTheDocument()
    expect(careersLink.closest('a')).toHaveAttribute('href', '/careers')
    
    expect(contactLink).toBeInTheDocument()
    expect(contactLink.closest('a')).toHaveAttribute('href', '/contact')
  })

  it('contains all the expected legal links', () => {
    render(<Footer />)
    
    const privacyLink = screen.getByText('Privacy Policy')
    const termsLink = screen.getByText('Terms of Service')
    
    expect(privacyLink).toBeInTheDocument()
    expect(privacyLink.closest('a')).toHaveAttribute('href', '/privacy')
    
    expect(termsLink).toBeInTheDocument()
    expect(termsLink.closest('a')).toHaveAttribute('href', '/terms')
  })

  it('has the correct responsive layout classes', () => {
    render(<Footer />)
    
    // Find the grid container with responsive classes
    const gridContainer = screen.getByText('Stockify').closest('div').parentElement
    expect(gridContainer).toHaveClass('grid')
    expect(gridContainer).toHaveClass('grid-cols-1')
    expect(gridContainer).toHaveClass('md:grid-cols-4')
  })
}) 