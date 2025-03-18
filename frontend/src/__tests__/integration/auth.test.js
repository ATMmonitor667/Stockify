describe('Auth API Integration', () => {
  // Mock fetch globally
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  test('successful signup request', async () => {
    // Mock successful response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ message: 'User created successfully' })
    });

    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      }),
    });

    const data = await response.json();
    
    // Verify the API was called correctly
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/signup', expect.any(Object));
    
    // Verify response
    expect(response.status).toBe(201);
    expect(data.message).toBe('User created successfully');
  });

  test('handles duplicate email error', async () => {
    // Mock error response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Email already exists' })
    });

    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser2',
        email: 'existing@example.com',
        password: 'Password123!'
      }),
    });

    const data = await response.json();
    
    // Verify the API was called correctly
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/signup', expect.any(Object));
    
    // Verify error response
    expect(response.status).toBe(400);
    expect(data.error).toBe('Email already exists');
  });
});