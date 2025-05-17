import { render, screen, waitFor } from '@testing-library/react';
import PostList from '@/components/PostList';

// Mock fetch
global.fetch = jest.fn();

describe('PostList Component', () => {
  const mockPosts = [
    {
      id: 1,
      content: 'Test post 1',
      author_name: 'User1',
      created_at: new Date().toISOString(),
      likes: 5,
      comments: 2
    },
    {
      id: 2,
      content: 'Test post 2',
      author_name: 'User2',
      created_at: new Date().toISOString(),
      likes: 3,
      comments: 1
    }
  ];

  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders posts after loading', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPosts
    });

    render(<PostList />);

    await waitFor(() => {
      expect(screen.getByText('Test post 1')).toBeInTheDocument();
      expect(screen.getByText('User1')).toBeInTheDocument();
      expect(screen.getByText('Test post 2')).toBeInTheDocument();
      expect(screen.getByText('User2')).toBeInTheDocument();
    });
  });

  test('shows error message on fetch failure', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<PostList />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading posts/i)).toBeInTheDocument();
    });
  });

  test('shows empty state when no posts', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    render(<PostList />);

    await waitFor(() => {
      expect(screen.getByText(/No posts yet/i)).toBeInTheDocument();
    });
  });
}); 