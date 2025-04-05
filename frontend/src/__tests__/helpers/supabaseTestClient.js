import { createClient } from '@supabase/supabase-js'

// Mock Supabase client for testing
export const createTestClient = () => {
  // Use test environment variables or mock values
  const supabaseUrl = process.env.SUPABASE_URL || 'https://test-project.supabase.co'
  const supabaseKey = process.env.SUPABASE_ANON_KEY || 'test-anon-key'

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Mock data for testing
export const mockPosts = [
  {
    id: 1,
    content: 'First post',
    author_name: 'User 1',
    author_id: '123',
    created_at: '2024-03-28T12:00:00Z'
  },
  {
    id: 2,
    content: 'Second post',
    author_name: 'User 2',
    author_id: '456',
    created_at: '2024-03-28T11:00:00Z'
  }
]

export const mockUser = {
  id: 'test-user',
  email: 'test@example.com',
  user_metadata: {
    name: 'Test User'
  }
};

// Test utility functions
export const setupMockSupabase = () => {
  jest.mock('@/config/supabaseClient', () => ({
    supabase: createTestClient()
  }));
};

export const setupMockUser = (isLoggedIn = true) => {
  jest.mock('@/config/UserContext', () => ({
    globalUser: jest.fn().mockReturnValue(isLoggedIn ? mockUser : null)
  }));
};

// Reset all mocks
export const resetMocks = () => {
  jest.clearAllMocks();
}; 