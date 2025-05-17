import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Explore from "../../components/Explore";
import "@testing-library/jest-dom";
import { supabase } from "@/config/supabaseClient";
import { getStockQuote, getCompanyProfile, searchStocks } from "@/config/finnhubClient";

// Mock the dependencies
jest.mock("@/config/supabaseClient");
jest.mock("@/config/finnhubClient");

describe("Explore Component", () => {
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

    // Mock stock data fetching
    getStockQuote.mockResolvedValue(mockStockData.AAPL.quote);
    getCompanyProfile.mockResolvedValue(mockStockData.AAPL.profile);
    searchStocks.mockResolvedValue([
      {
        symbol: "AAPL",
        description: "Apple Inc",
        type: "Common Stock"
      }
    ]);
  });

  test("renders without errors", async () => {
    render(<Explore />);
    await waitFor(() => {
      expect(screen.getByText("Explore Stocks")).toBeInTheDocument();
    });
  });

  test("displays user balance", async () => {
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

    render(<Explore />);
    
    await waitFor(() => {
      expect(screen.getByText(/Balance:/i)).toBeInTheDocument();
      expect(screen.getByText("$1,000.00")).toBeInTheDocument();
    });
  });

  test("handles stock search", async () => {
    render(<Explore />);
    
    const searchInput = screen.getByPlaceholderText(/Search by symbol or company name/i);
    fireEvent.change(searchInput, { target: { value: "AAPL" } });
    
    const searchButton = screen.getByRole("button", { name: /Search/i });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText("Apple Inc")).toBeInTheDocument();
    });
  });

  test("displays featured stocks", async () => {
    render(<Explore />);
    
    await waitFor(() => {
      expect(screen.getByText("Featured Stocks")).toBeInTheDocument();
    });
  });

  test("displays trending stocks", async () => {
    render(<Explore />);
    
    await waitFor(() => {
      expect(screen.getByText("Trending Stocks")).toBeInTheDocument();
    });
  });

  test("handles market closed state", async () => {
    // Mock current time outside market hours
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-01T20:00:00Z")); // 8 PM EST

    render(<Explore />);
    
    await waitFor(() => {
      expect(screen.getByText(/Market Closed/i)).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  test("handles stock card click", async () => {
    render(<Explore />);
    
    await waitFor(() => {
      const stockCard = screen.getByText("Apple Inc");
      fireEvent.click(stockCard);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Trade/i)).toBeInTheDocument();
    });
  });

  test("handles error state", async () => {
    // Mock error in stock data fetching
    getStockQuote.mockRejectedValue(new Error("Failed to fetch stock data"));

    render(<Explore />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error/i)).toBeInTheDocument();
    });
  });

  test("displays loading state", () => {
    render(<Explore />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  test("handles empty search results", async () => {
    // Mock empty search results
    searchStocks.mockResolvedValue([]);

    render(<Explore />);
    
    const searchInput = screen.getByPlaceholderText(/Search by symbol or company name/i);
    fireEvent.change(searchInput, { target: { value: "INVALID" } });
    
    const searchButton = screen.getByRole("button", { name: /Search/i });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText(/No matching stocks found/i)).toBeInTheDocument();
    });
  });

  test("handles popular stock suggestions", async () => {
    render(<Explore />);
    
    const popularStock = screen.getByText("AAPL");
    fireEvent.click(popularStock);
    
    await waitFor(() => {
      expect(screen.getByText("Apple Inc")).toBeInTheDocument();
    });
  });
}); 