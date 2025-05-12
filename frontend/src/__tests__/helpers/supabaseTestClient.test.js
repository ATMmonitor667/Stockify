import { 
  mockSupabase, 
  mockPosts, 
  mockUser, 
  setupMockSupabase, 
  setupMockUser, 
  resetMocks 
} from './supabaseTestClient';

// Mock the external modules directly
jest.mock('@/config/supabaseClient', () => ({
  supabase: mockSupabase
}));

// Create a simple mock for UserContext
jest.mock('@/config/UserContext', () => ({}));

describe('supabaseTestClient helper', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('exports mock data for usage in tests', () => {
    // Verify mockPosts has expected structure
    expect(mockPosts).toEqual([
      expect.objectContaining({
        id: 1,
        content: 'First post',
        author_name: 'User 1',
        author_id: '123',
        created_at: '2024-03-28T12:00:00Z'
      }),
      expect.objectContaining({
        id: 2,
        content: 'Second post',
        author_name: 'User 2',
        author_id: '456',
        created_at: '2024-03-28T11:00:00Z'
      })
    ]);

    // Verify mockUser has expected structure
    expect(mockUser).toEqual({
      id: 'test-user',
      email: 'test@example.com',
      user_metadata: {
        name: 'Test User'
      }
    });
  });

  it('exports mock Supabase client with expected methods', () => {
    // Verify mockSupabase has expected structure
    expect(mockSupabase).toEqual(
      expect.objectContaining({
        from: expect.any(Function),
        auth: expect.objectContaining({
          getUser: expect.any(Function),
          signUp: expect.any(Function),
          signInWithPassword: expect.any(Function),
          signIn: expect.any(Function),
          signOut: expect.any(Function)
        })
      })
    );
  });

  it('setupMockSupabase function exists and is callable', () => {
    // Verify the function exists
    expect(typeof setupMockSupabase).toBe('function');
    
    // Verify it can be called without errors
    expect(() => setupMockSupabase()).not.toThrow();
  });

  it('setupMockUser function exists and is callable with isLoggedIn=true', () => {
    // Verify the function exists
    expect(typeof setupMockUser).toBe('function');
    
    // Verify it can be called without errors
    expect(() => setupMockUser(true)).not.toThrow();
  });

  it('setupMockUser function exists and is callable with isLoggedIn=false', () => {
    // Verify the function exists
    expect(typeof setupMockUser).toBe('function');
    
    // Verify it can be called without errors
    expect(() => setupMockUser(false)).not.toThrow();
  });

  it('resetMocks correctly clears all mocks', () => {
    // Set up some initial mocks with mock implementations
    mockSupabase.from.mockImplementation(() => ({}));
    mockSupabase.auth.getUser.mockImplementation(() => ({}));
    mockSupabase.auth.signIn.mockImplementation(() => ({}));
    mockSupabase.auth.signOut.mockImplementation(() => ({}));
    
    // Call each mocked function to register calls
    mockSupabase.from();
    mockSupabase.auth.getUser();
    mockSupabase.auth.signIn();
    mockSupabase.auth.signOut();
    
    // Verify mock functions were called
    expect(mockSupabase.from).toHaveBeenCalled();
    expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    expect(mockSupabase.auth.signIn).toHaveBeenCalled();
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    
    // Reset the mocks
    resetMocks();
    
    // Verify mock functions were reset
    expect(mockSupabase.from).not.toHaveBeenCalled();
    expect(mockSupabase.auth.getUser).not.toHaveBeenCalled();
    expect(mockSupabase.auth.signIn).not.toHaveBeenCalled();
    expect(mockSupabase.auth.signOut).not.toHaveBeenCalled();
  });
}); 