import { jest } from '@jest/globals';

// Mock user data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    name: 'Test User'
  }
};

// Mock session data
export const mockSession = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  user: mockUser
};

// Mock database response
export const mockDbResponse = {
  data: [],
  error: null,
  count: 0
};

// Create a mock Supabase client
export const createMockSupabase = () => {
  const mockClient = {
    auth: {
      signUp: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: mockUser, session: mockSession }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      getSession: jest.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
      getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } })
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue(mockDbResponse),
    subscribe: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      unsubscribe: jest.fn()
    })
  };

  return mockClient;
};

// Reset all mocks
export const resetSupabaseMocks = (mockClient) => {
  Object.values(mockClient).forEach(method => {
    if (typeof method === 'function') {
      method.mockClear();
    } else if (typeof method === 'object') {
      Object.values(method).forEach(subMethod => {
        if (typeof subMethod === 'function') {
          subMethod.mockClear();
        }
      });
    }
  });
};

// Mock error response
export const mockError = (message = 'Test error') => ({
  data: null,
  error: {
    message,
    status: 400
  }
});

// Mock success response
export const mockSuccess = (data = []) => ({
  data,
  error: null
}); 