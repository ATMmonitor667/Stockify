import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TradeModal from '@/components/TradeModal';
import { supabase } from '@/config/supabaseClient';

// Mock the dependencies
jest.mock('@/config/supabaseClient', () => ({
  supabase: {
    from: jest.fn()
  }
}));

describe('TradeModal Component', () => {
  const mockStock = {
    quote: {
      c: 150.00,  // current price
      d: 2.50,    // price change
      dp: 1.67,   // percent change
      o: 148.00,  // open price
      h: 152.00   // high price
    },
    profile: {
      name: 'Apple Inc',
      ticker: 'AAPL'
    }
  };

  const mockOnClose = jest.fn();
  const mockOnTrade = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock user profile data
    supabase.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: { wallet_amt: 10000.00 },
            error: null
          })
        })
      })
    }));
  });

  test('renders trade modal with stock information', () => {
    render(
      <TradeModal
        stock={mockStock}
        onClose={mockOnClose}
        onTrade={mockOnTrade}
      />
    );

    expect(screen.getByText('Trade AAPL')).toBeInTheDocument();
    expect(screen.getByText('Apple Inc')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
    expect(screen.getByText('+1.67%')).toBeInTheDocument();
  });

  test('handles buy trade', async () => {
    render(
      <TradeModal
        stock={mockStock}
        onClose={mockOnClose}
        onTrade={mockOnTrade}
      />
    );

    // Select buy option
    const buyRadio = screen.getByLabelText('Buy');
    fireEvent.click(buyRadio);

    // Enter quantity
    const quantityInput = screen.getByTestId('quantity-input');
    fireEvent.change(quantityInput, { target: { value: '5' } });

    // Verify total calculation
    expect(screen.getByText('$750.00')).toBeInTheDocument();

    // Submit trade
    const submitButton = screen.getByTestId('submit-trade');
    fireEvent.click(submitButton);

    // Verify trade callback
    await waitFor(() => {
      expect(mockOnTrade).toHaveBeenCalledWith('AAPL', 'buy', 5);
    });
  });

  test('handles sell trade', async () => {
    render(
      <TradeModal
        stock={mockStock}
        onClose={mockOnClose}
        onTrade={mockOnTrade}
      />
    );

    // Select sell option
    const sellRadio = screen.getByLabelText('Sell');
    fireEvent.click(sellRadio);

    // Enter quantity
    const quantityInput = screen.getByTestId('quantity-input');
    fireEvent.change(quantityInput, { target: { value: '3' } });

    // Verify total calculation
    expect(screen.getByText('$450.00')).toBeInTheDocument();

    // Submit trade
    const submitButton = screen.getByTestId('submit-trade');
    fireEvent.click(submitButton);

    // Verify trade callback
    await waitFor(() => {
      expect(mockOnTrade).toHaveBeenCalledWith('AAPL', 'sell', 3);
    });
  });

  test('validates minimum trade quantity', async () => {
    render(
      <TradeModal
        stock={mockStock}
        onClose={mockOnClose}
        onTrade={mockOnTrade}
      />
    );

    // Enter invalid quantity
    const quantityInput = screen.getByTestId('quantity-input');
    fireEvent.change(quantityInput, { target: { value: '0' } });

    // Submit trade
    const submitButton = screen.getByTestId('submit-trade');
    fireEvent.click(submitButton);

    // Verify error message
    expect(screen.getByText('Quantity must be greater than 0')).toBeInTheDocument();
    expect(mockOnTrade).not.toHaveBeenCalled();
  });

  test('validates maximum trade quantity based on balance', async () => {
    // Mock lower balance
    supabase.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: { wallet_amt: 100.00 },
            error: null
          })
        })
      })
    }));

    render(
      <TradeModal
        stock={mockStock}
        onClose={mockOnClose}
        onTrade={mockOnTrade}
      />
    );

    // Select buy option
    const buyRadio = screen.getByLabelText('Buy');
    fireEvent.click(buyRadio);

    // Enter quantity that exceeds balance
    const quantityInput = screen.getByTestId('quantity-input');
    fireEvent.change(quantityInput, { target: { value: '10' } });

    // Submit trade
    const submitButton = screen.getByTestId('submit-trade');
    fireEvent.click(submitButton);

    // Verify error message
    expect(screen.getByText(/insufficient funds/i)).toBeInTheDocument();
    expect(mockOnTrade).not.toHaveBeenCalled();
  });

  test('handles modal close', () => {
    render(
      <TradeModal
        stock={mockStock}
        onClose={mockOnClose}
        onTrade={mockOnTrade}
      />
    );

    // Click close button
    const closeButton = screen.getByTestId('close-modal');
    fireEvent.click(closeButton);

    // Verify close callback
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('updates total amount when quantity changes', () => {
    render(
      <TradeModal
        stock={mockStock}
        onClose={mockOnClose}
        onTrade={mockOnTrade}
      />
    );

    // Enter quantity
    const quantityInput = screen.getByTestId('quantity-input');
    fireEvent.change(quantityInput, { target: { value: '5' } });

    // Verify total calculation
    expect(screen.getByText('$750.00')).toBeInTheDocument();

    // Change quantity
    fireEvent.change(quantityInput, { target: { value: '3' } });

    // Verify updated total
    expect(screen.getByText('$450.00')).toBeInTheDocument();
  });

  test('handles network error during trade', async () => {
    // Mock trade error
    mockOnTrade.mockRejectedValue(new Error('Network error'));

    render(
      <TradeModal
        stock={mockStock}
        onClose={mockOnClose}
        onTrade={mockOnTrade}
      />
    );

    // Enter quantity and submit
    const quantityInput = screen.getByTestId('quantity-input');
    fireEvent.change(quantityInput, { target: { value: '5' } });

    const submitButton = screen.getByTestId('submit-trade');
    fireEvent.click(submitButton);

    // Verify error message
    await waitFor(() => {
      expect(screen.getByText(/failed to execute trade/i)).toBeInTheDocument();
    });
  });
}); 