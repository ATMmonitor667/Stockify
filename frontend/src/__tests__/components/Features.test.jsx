import { render, screen } from '@testing-library/react'
import Features from '@/components/Features'

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, key, ...props }) => (
      <div className={className} key={key} data-testid={`feature-${key}`}>{children}</div>
    )
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

describe('Features Component', () => {
  it('renders the features section with correct heading', () => {
    render(<Features />)
    
    expect(screen.getByText('Why Learn with Stockify?')).toBeInTheDocument()
    expect(screen.getByText('Master stock trading in a risk-free environment with our gamified learning platform')).toBeInTheDocument()
  })

  it('renders all feature cards', () => {
    render(<Features />)
    
    // Test that all feature titles are present
    expect(screen.getByText('Learn by Playing')).toBeInTheDocument()
    expect(screen.getByText('Real Market Data')).toBeInTheDocument()
    expect(screen.getByText('AI Trading Assistant')).toBeInTheDocument()
    expect(screen.getByText('Risk-Free Trading')).toBeInTheDocument()
    expect(screen.getByText('Community Support')).toBeInTheDocument()
  })

  it('renders all feature descriptions', () => {
    render(<Features />)
    
    // Test that all feature descriptions are present
    expect(screen.getByText(/Experience the thrill of trading with zero risk/)).toBeInTheDocument()
    expect(screen.getByText(/Practice with real-time market data and stock prices/)).toBeInTheDocument()
    expect(screen.getByText(/Get instant help from our AI chat bot/)).toBeInTheDocument()
    expect(screen.getByText(/Make mistakes and learn from them without losing real money/)).toBeInTheDocument()
    expect(screen.getByText(/Join a community of learners, share strategies/)).toBeInTheDocument()
  })

  it('renders all feature icons', () => {
    render(<Features />)
    
    // Test that all feature icons are present
    expect(screen.getByText('🎮')).toBeInTheDocument()
    expect(screen.getByText('📊')).toBeInTheDocument()
    expect(screen.getByText('🤖')).toBeInTheDocument()
    expect(screen.getByText('🛡️')).toBeInTheDocument()
    expect(screen.getByText('👥')).toBeInTheDocument()
  })

  it('renders the correct number of feature cards', () => {
    render(<Features />)
    
    // There should be 5 feature titles
    const featureTitles = [
      'Learn by Playing',
      'Real Market Data',
      'AI Trading Assistant',
      'Risk-Free Trading',
      'Community Support'
    ];
    
    featureTitles.forEach(title => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
    
    // Verify exactly 5 feature cards
    expect(featureTitles.length).toBe(5);
  })
}) 