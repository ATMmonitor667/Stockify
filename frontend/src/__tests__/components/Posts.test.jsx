import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Posts from "../../components/Posts";
import "@testing-library/jest-dom";
import { supabase } from "@/config/supabaseClient";

// Mock the dependencies
jest.mock("@/config/supabaseClient");

describe("Posts Component", () => {
  const mockUser = {
    id: "123",
    email: "test@example.com",
    user_metadata: {
      full_name: "Test User"
    }
  };

  const mockPosts = [
    {
      id: 1,
      content: "Test post 1",
      user_id: "123",
      created_at: "2024-01-01T00:00:00Z",
      user: {
        full_name: "Test User"
      }
    },
    {
      id: 2,
      content: "Test post 2",
      user_id: "456",
      created_at: "2024-01-02T00:00:00Z",
      user: {
        full_name: "Another User"
      }
    }
  ];

  beforeEach(() => {
    // Mock Supabase auth session
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } }
    });

    // Mock posts data fetching
    supabase.from.mockImplementation(() => ({
      select: () => ({
        order: () => Promise.resolve({
          data: mockPosts,
          error: null
        })
      })
    }));
  });

  test("renders without errors", async () => {
    render(<Posts />);
    await waitFor(() => {
      expect(screen.getByText("Community Posts")).toBeInTheDocument();
    });
  });

  test("displays posts", async () => {
    render(<Posts />);
    
    await waitFor(() => {
      expect(screen.getByText("Test post 1")).toBeInTheDocument();
      expect(screen.getByText("Test post 2")).toBeInTheDocument();
    });
  });

  test("displays post authors", async () => {
    render(<Posts />);
    
    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
      expect(screen.getByText("Another User")).toBeInTheDocument();
    });
  });

  test("handles post submission", async () => {
    render(<Posts />);
    
    const input = screen.getByPlaceholderText(/What's on your mind/i);
    fireEvent.change(input, { target: { value: "New test post" } });
    
    const submitButton = screen.getByRole("button", { name: /Post/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("posts");
    });
  });

  test("handles post deletion", async () => {
    render(<Posts />);
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByRole("button", { name: /Delete/i });
      fireEvent.click(deleteButtons[0]);
    });
    
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("posts");
    });
  });

  test("displays loading state", () => {
    render(<Posts />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  test("handles error state", async () => {
    // Mock error response
    supabase.from.mockImplementation(() => ({
      select: () => ({
        order: () => Promise.resolve({
          data: null,
          error: new Error("Failed to fetch posts")
        })
      })
    }));

    render(<Posts />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error loading posts/i)).toBeInTheDocument();
    });
  });

  test("formats post dates correctly", async () => {
    render(<Posts />);
    
    await waitFor(() => {
      expect(screen.getByText(/January 1, 2024/i)).toBeInTheDocument();
      expect(screen.getByText(/January 2, 2024/i)).toBeInTheDocument();
    });
  });

  test("handles empty posts state", async () => {
    // Mock empty posts response
    supabase.from.mockImplementation(() => ({
      select: () => ({
        order: () => Promise.resolve({
          data: [],
          error: null
        })
      })
    }));

    render(<Posts />);
    
    await waitFor(() => {
      expect(screen.getByText(/No posts yet/i)).toBeInTheDocument();
    });
  });

  test("validates post content", async () => {
    render(<Posts />);
    
    const input = screen.getByPlaceholderText(/What's on your mind/i);
    fireEvent.change(input, { target: { value: "" } });
    
    const submitButton = screen.getByRole("button", { name: /Post/i });
    fireEvent.click(submitButton);
    
    expect(screen.getByText(/Post cannot be empty/i)).toBeInTheDocument();
  });
}); 