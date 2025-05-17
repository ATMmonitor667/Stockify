import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Explore from "../../components/Explore";
import TradeModal from "../../components/TradeModal";
import { supabase } from "@/config/supabaseClient";
import { getStockQuote, getCompanyProfile } from "@/config/finnhubClient";
import "@testing-library/jest-dom";

// Mock the dependencies
jest.mock("@/config/supabaseClient");
jest.mock("@/config/finnhubClient");

describe("Stock Trading Integration", () => {
  const mockUser = {
    id: "123",
    email: "test@example.com",
    user_metadata: {
      full_name: "Test User"
    }
  };

  const mockStockData = {
    AAPL: {
      quote: {
        c: 150.00,
        d: 2.50,
        dp: 1.67,
        h: 152.00,
        l: 148.00,
        o: 149.00,
        pc: 147.50
      },
      profile: {
        name: "Apple Inc",
        ticker: "AAPL",
        logo: "apple-logo.png"
      }
    }
  };

  beforeEach(() => {
    // Mock Supabase auth session
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } }
    });

    // Mock user balance
    supabase.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: { wallet_amt: 1000 },
            error: null
          })
        })
      })
    }));

    // Mock stock data
    getStockQuote.mockResolvedValue(mockStockData.AAPL.quote);
    getCompanyProfile.mockResolvedValue(mockStockData.AAPL.profile);
  });

  test("complete stock trading flow", async () => {
    // Render the Explore component
    render(<Explore />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText("Explore Stocks")).toBeInTheDocument();
    });

    // Search for a stock
    const searchInput = screen.getByPlaceholderText(/Search by symbol or company name/i);
    fireEvent.change(searchInput, { target: { value: "AAPL" } });
    
    const searchButton = screen.getByRole("button", { name: /Search/i });
    fireEvent.click(searchButton);

    // Wait for stock data to load
    await waitFor(() => {
      expect(screen.getByText("Apple Inc")).toBeInTheDocument();
    });

    // Click on stock card to open trade modal
    const stockCard = screen.getByText("Apple Inc");
    fireEvent.click(stockCard);

    // Verify trade modal opens
    await waitFor(() => {
      expect(screen.getByText(/Trade/i)).toBeInTheDocument();
    });

    // Enter trade quantity
    const quantityInput = screen.getByLabelText(/Quantity/i);
    fireEvent.change(quantityInput, { target: { value: "5" } });

    // Click buy button
    const buyButton = screen.getByRole("button", { name: /Buy/i });
    fireEvent.click(buyButton);

    // Verify trade execution
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("userstock");
    });

    // Verify balance update
    await waitFor(() => {
      expect(screen.getByText(/Balance:/i)).toBeInTheDocument();
    });
  });

  test("portfolio update after trade", async () => {
    // Mock initial portfolio data
    supabase.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: { wallet_amt: 1000 },
            error: null
          })
        })
      })
    }));

    render(<Explore />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText("Explore Stocks")).toBeInTheDocument();
    });

    // Search and select stock
    const searchInput = screen.getByPlaceholderText(/Search by symbol or company name/i);
    fireEvent.change(searchInput, { target: { value: "AAPL" } });
    fireEvent.click(screen.getByRole("button", { name: /Search/i }));

    // Open trade modal
    await waitFor(() => {
      const stockCard = screen.getByText("Apple Inc");
      fireEvent.click(stockCard);
    });

    // Execute trade
    const quantityInput = screen.getByLabelText(/Quantity/i);
    fireEvent.change(quantityInput, { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: /Buy/i }));

    // Verify portfolio update
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("userstock");
    });
  });

  test("error handling in trading flow", async () => {
    // Mock error in stock data fetching
    getStockQuote.mockRejectedValue(new Error("Failed to fetch stock data"));

    render(<Explore />);

    // Attempt to search for stock
    const searchInput = screen.getByPlaceholderText(/Search by symbol or company name/i);
    fireEvent.change(searchInput, { target: { value: "AAPL" } });
    fireEvent.click(screen.getByRole("button", { name: /Search/i }));

    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText(/Error/i)).toBeInTheDocument();
    });
  });

  test("insufficient funds handling", async () => {
    // Mock low balance
    supabase.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: { wallet_amt: 100 }, // Low balance
            error: null
          })
        })
      })
    }));

    render(<Explore />);

    // Search and select stock
    const searchInput = screen.getByPlaceholderText(/Search by symbol or company name/i);
    fireEvent.change(searchInput, { target: { value: "AAPL" } });
    fireEvent.click(screen.getByRole("button", { name: /Search/i }));

    // Open trade modal
    await waitFor(() => {
      const stockCard = screen.getByText("Apple Inc");
      fireEvent.click(stockCard);
    });

    // Attempt large trade
    const quantityInput = screen.getByLabelText(/Quantity/i);
    fireEvent.change(quantityInput, { target: { value: "100" } });
    fireEvent.click(screen.getByRole("button", { name: /Buy/i }));

    // Verify insufficient funds error
    await waitFor(() => {
      expect(screen.getByText(/Insufficient funds/i)).toBeInTheDocument();
    });
  });
}); 