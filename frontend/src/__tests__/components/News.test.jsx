import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import News from "../../components/News";
import "@testing-library/jest-dom";
import { getNews } from "@/config/finnhubClient";

// Mock the dependencies
jest.mock("@/config/finnhubClient");

describe("News Component", () => {
  const mockNews = [
    {
      id: 1,
      headline: "Test News 1",
      summary: "This is a test news article 1",
      url: "https://example.com/news1",
      datetime: 1704067200, // 2024-01-01T00:00:00Z
      image: "https://example.com/image1.jpg"
    },
    {
      id: 2,
      headline: "Test News 2",
      summary: "This is a test news article 2",
      url: "https://example.com/news2",
      datetime: 1704153600, // 2024-01-02T00:00:00Z
      image: "https://example.com/image2.jpg"
    }
  ];

  beforeEach(() => {
    // Mock news data fetching
    getNews.mockResolvedValue(mockNews);
  });

  test("renders without errors", async () => {
    render(<News />);
    await waitFor(() => {
      expect(screen.getByText("Latest News")).toBeInTheDocument();
    });
  });

  test("displays news articles", async () => {
    render(<News />);
    
    await waitFor(() => {
      expect(screen.getByText("Test News 1")).toBeInTheDocument();
      expect(screen.getByText("Test News 2")).toBeInTheDocument();
    });
  });

  test("displays article descriptions", async () => {
    render(<News />);
    
    await waitFor(() => {
      expect(screen.getByText("This is a test news article 1")).toBeInTheDocument();
      expect(screen.getByText("This is a test news article 2")).toBeInTheDocument();
    });
  });

  test("handles article click", async () => {
    const mockOpen = jest.fn();
    window.open = mockOpen;

    render(<News />);
    
    await waitFor(() => {
      const article = screen.getByText("Test News 1");
      fireEvent.click(article);
    });
    
    expect(mockOpen).toHaveBeenCalledWith("https://example.com/news1", "_blank");
  });

  test("displays loading state", () => {
    render(<News />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  test("handles error state", async () => {
    // Mock error response
    getNews.mockRejectedValue(new Error("Failed to fetch news"));

    render(<News />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error loading news/i)).toBeInTheDocument();
    });
  });

  test("displays article images", async () => {
    render(<News />);
    
    await waitFor(() => {
      const images = screen.getAllByRole("img");
      expect(images[0]).toHaveAttribute("src", "https://example.com/image1.jpg");
      expect(images[1]).toHaveAttribute("src", "https://example.com/image2.jpg");
    });
  });

  test("formats article dates correctly", async () => {
    render(<News />);
    
    await waitFor(() => {
      expect(screen.getByText(/January 1, 2024/i)).toBeInTheDocument();
      expect(screen.getByText(/January 2, 2024/i)).toBeInTheDocument();
    });
  });

  test("handles empty news response", async () => {
    // Mock empty news response
    getNews.mockResolvedValue([]);

    render(<News />);
    
    await waitFor(() => {
      expect(screen.getByText(/No news available/i)).toBeInTheDocument();
    });
  });

  test("handles missing article data", async () => {
    // Mock news with missing data
    const incompleteNews = [
      {
        id: 1,
        headline: "Test News 1",
        // Missing summary
        url: "https://example.com/news1",
        datetime: 1704067200,
        // Missing image
      }
    ];
    getNews.mockResolvedValue(incompleteNews);

    render(<News />);
    
    await waitFor(() => {
      expect(screen.getByText("Test News 1")).toBeInTheDocument();
      // Should not throw error for missing data
    });
  });
}); 