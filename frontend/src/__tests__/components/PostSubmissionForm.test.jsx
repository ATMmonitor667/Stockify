import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PostSubmissionForm from '@/components/PostSubmissionForm';

describe('PostSubmissionForm Component', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  test('renders form elements correctly', () => {
    render(<PostSubmissionForm onSubmit={mockOnSubmit} />);
    expect(screen.getByPlaceholderText("What's on your mind?")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Post' })).toBeInTheDocument();
  });

  test('updates character count as user types', () => {
    render(<PostSubmissionForm onSubmit={mockOnSubmit} />);
    const textarea = screen.getByPlaceholderText("What's on your mind?");
    fireEvent.change(textarea, { target: { value: 'Test post' } });
    expect(screen.getByText(/9\/500/)).toBeInTheDocument();
  });

  test('submit button is disabled when empty', () => {
    render(<PostSubmissionForm onSubmit={mockOnSubmit} />);
    const submitButton = screen.getByRole('button', { name: 'Post' });
    expect(submitButton).toBeDisabled();
  });

  test('submit button is enabled when content is present', () => {
    render(<PostSubmissionForm onSubmit={mockOnSubmit} />);
    const textarea = screen.getByPlaceholderText("What's on your mind?");
    fireEvent.change(textarea, { target: { value: 'Test post' } });
    const submitButton = screen.getByRole('button', { name: 'Post' });
    expect(submitButton).not.toBeDisabled();
  });

  test('shows loading state', () => {
    render(<PostSubmissionForm onSubmit={mockOnSubmit} isSubmitting={true} />);
    const submitButton = screen.getByRole('button', { name: 'Post' });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Post');
  });

  test('calls onSubmit with content when submitted', async () => {
    render(<PostSubmissionForm onSubmit={mockOnSubmit} />);
    const textarea = screen.getByPlaceholderText("What's on your mind?");
    fireEvent.change(textarea, { target: { value: 'Test post' } });
    const submitButton = screen.getByRole('button', { name: 'Post' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('Test post');
      expect(textarea.value).toBe('');
    });
  });

  test('enforces maximum character length', () => {
    render(<PostSubmissionForm onSubmit={mockOnSubmit} />);
    const textarea = screen.getByPlaceholderText("What's on your mind?");
    const longText = 'a'.repeat(600);
    fireEvent.change(textarea, { target: { value: longText } });
    
    expect(textarea.value.length).toBeLessThanOrEqual(500);
    expect(screen.getByText(/500\/500/)).toBeInTheDocument();
  });
}); 