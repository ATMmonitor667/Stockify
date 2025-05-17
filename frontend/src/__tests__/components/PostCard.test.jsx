import { render, screen, fireEvent } from '@testing-library/react'
import PostCard from '@/components/PostCard'
import { useRouter } from 'next/router'
import { useGlobalUser } from '@/config/UserContext'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}))

// Mock UserContext
jest.mock('@/config/UserContext', () => ({
  useGlobalUser: jest.fn()
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  }
}))

describe('PostCard Component', () => {
  const mockPost = {
    id: 1,
    author_id: 'user123',
    author_name: 'John Doe',
    content: 'This is a test post',
    created_at: '2024-03-20T10:00:00Z',
    likes: 5,
    comments: 3
  };

  beforeEach(() => {
    useGlobalUser.mockReturnValue({ id: 'test-user' });
  });

  test('renders post content correctly', () => {
    render(
      <PostCard 
        post={mockPost}
        onFollow={jest.fn()}
        isFollowing={false}
        showFollowButton={true}
      />
    );

    expect(screen.getByText('This is a test post')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('shows follow button when not following', () => {
    render(
      <PostCard 
        post={mockPost}
        onFollow={jest.fn()}
        isFollowing={false}
        showFollowButton={true}
      />
    );

    expect(screen.getByRole('button', { name: 'Follow' })).toBeInTheDocument();
  });

  test('shows following button when following', () => {
    render(
      <PostCard 
        post={mockPost}
        onFollow={jest.fn()}
        isFollowing={true}
        showFollowButton={true}
      />
    );

    expect(screen.getByRole('button', { name: 'Following' })).toBeInTheDocument();
  });

  test('calls onFollow when clicking follow button', () => {
    const mockOnFollow = jest.fn();
    render(
      <PostCard 
        post={mockPost}
        onFollow={mockOnFollow}
        isFollowing={false}
        showFollowButton={true}
      />
    );

    const followButton = screen.getByRole('button', { name: 'Follow' });
    fireEvent.click(followButton);
    expect(mockOnFollow).toHaveBeenCalledWith('user123');
  });

  test('shows "Your Post" when post is from current user', () => {
    useGlobalUser.mockReturnValue({ id: 'user123' });
    
    render(
      <PostCard 
        post={mockPost}
        onFollow={jest.fn()}
        isFollowing={false}
        showFollowButton={true}
      />
    );

    expect(screen.getByText('Your Post')).toBeInTheDocument();
  });

  test('redirects to login when clicking follow without being logged in', () => {
    useGlobalUser.mockReturnValue(null);
    const mockRouter = { push: jest.fn() };
    jest.spyOn(require('next/router'), 'useRouter').mockReturnValue(mockRouter);
    
    render(
      <PostCard 
        post={mockPost}
        onFollow={jest.fn()}
        isFollowing={false}
        showFollowButton={true}
      />
    );

    const followButton = screen.getByRole('button', { name: 'Follow' });
    fireEvent.click(followButton);
    expect(mockRouter.push).toHaveBeenCalledWith('/login?redirect=/posts');
  });

  test('does not show follow button when showFollowButton is false', () => {
    render(
      <PostCard 
        post={mockPost}
        onFollow={jest.fn()}
        isFollowing={false}
        showFollowButton={false}
      />
    );

    expect(screen.queryByRole('button', { name: 'Follow' })).not.toBeInTheDocument();
  });

  test('formats time correctly', () => {
    render(
      <PostCard 
        post={mockPost}
        onFollow={jest.fn()}
        isFollowing={false}
        showFollowButton={true}
      />
    );

    expect(screen.getByText(/Mar 20/)).toBeInTheDocument();
  });

  test('handles post with no likes or comments', () => {
    const postWithoutInteractions = {
      ...mockPost,
      likes: 0,
      comments: 0
    };

    render(
      <PostCard 
        post={postWithoutInteractions}
        onFollow={jest.fn()}
        isFollowing={false}
        showFollowButton={true}
      />
    );

    expect(screen.getByText('0')).toBeInTheDocument(); // likes
    expect(screen.getByText('0')).toBeInTheDocument(); // comments
  });
}); 