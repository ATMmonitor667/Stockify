import {
  mockProfiles,
  mockPosts,
  mockStocks,
  mockUserStocks,
  mockSuccessfulResponse,
  mockErrorResponse,
  mockSupabaseDb,
  resetMockSupabaseDb,
  setupMockSupabaseDb
} from './supabaseDbTestClient';

// Mock the external module before importing
jest.mock('@/config/supabaseClient', () => ({}));

describe('supabaseDbTestClient helper', () => {
  beforeEach(() => {
    resetMockSupabaseDb();
  });

  it('exports mock data for usage in tests', () => {
    // Verify mockProfiles has expected structure
    expect(mockProfiles).toEqual([
      expect.objectContaining({
        user_id: 'test-user-1',
        user_name: 'Test User 1',
        wallet_amt: 10000.0
      }),
      expect.objectContaining({
        user_id: 'test-user-2',
        user_name: 'Test User 2',
        wallet_amt: 15000.0
      })
    ]);

    // Verify mockPosts has expected structure
    expect(mockPosts).toEqual([
      expect.objectContaining({
        id: 1,
        user_id: 'test-user-1',
        title: 'Test Post 1',
        content: 'Test Content 1',
        created_at: '2024-01-01T00:00:00Z'
      }),
      expect.objectContaining({
        id: 2,
        user_id: 'test-user-2',
        title: 'Test Post 2',
        content: 'Test Content 2',
        created_at: '2024-01-02T00:00:00Z'
      })
    ]);

    // Verify mockStocks has expected structure
    expect(mockStocks).toEqual([
      expect.objectContaining({
        id: 1,
        symbol: 'AAPL',
        name: 'Apple Inc.',
        current_price: 150.0
      }),
      expect.objectContaining({
        id: 2,
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        current_price: 2800.0
      })
    ]);

    // Verify mockUserStocks has expected structure
    expect(mockUserStocks).toEqual([
      expect.objectContaining({
        id: 1,
        user_id: 'test-user-1',
        stock_id: 1,
        quantity: 10,
        purchase_price: 145.0
      }),
      expect.objectContaining({
        id: 2,
        user_id: 'test-user-1',
        stock_id: 2,
        quantity: 5,
        purchase_price: 2750.0
      })
    ]);
  });

  it('mockSuccessfulResponse creates expected structure', () => {
    const testData = { id: 1, name: 'Test' };
    const response = mockSuccessfulResponse(testData);
    expect(response).toEqual({
      data: testData,
      error: null
    });
  });

  it('mockErrorResponse creates expected structure', () => {
    const errorMessage = 'Test error message';
    const response = mockErrorResponse(errorMessage);
    expect(response).toEqual({
      data: null,
      error: { message: errorMessage }
    });
  });

  it('from() sets the table name correctly', () => {
    const result = mockSupabaseDb.from('profiles');
    expect(result).toBe(mockSupabaseDb);
    expect(mockSupabaseDb._queryTracker.currentTable).toBe('profiles');
  });

  it('select() sets the operation to select', () => {
    mockSupabaseDb.from('profiles').select('id, name');
    expect(mockSupabaseDb._queryTracker.currentOperation).toBe('select');
    expect(mockSupabaseDb._queryTracker.currentParams).toEqual({ columns: 'id, name' });
  });

  it('select() defaults to "*" when no columns specified', () => {
    mockSupabaseDb.from('profiles').select();
    expect(mockSupabaseDb._queryTracker.currentParams).toEqual({ columns: '*' });
  });

  it('insert() sets the operation to insert with data', () => {
    const data = { name: 'Test User', email: 'test@example.com' };
    mockSupabaseDb.from('profiles').insert(data);
    expect(mockSupabaseDb._queryTracker.currentOperation).toBe('insert');
    expect(mockSupabaseDb._queryTracker.currentParams).toEqual({ data });
  });

  it('update() sets the operation to update with data', () => {
    const data = { name: 'Updated Name' };
    mockSupabaseDb.from('profiles').update(data);
    expect(mockSupabaseDb._queryTracker.currentOperation).toBe('update');
    expect(mockSupabaseDb._queryTracker.currentParams).toEqual({ data });
  });

  it('delete() sets the operation to delete', () => {
    mockSupabaseDb.from('profiles').delete();
    expect(mockSupabaseDb._queryTracker.currentOperation).toBe('delete');
  });

  it('eq() adds equality condition', () => {
    mockSupabaseDb.from('profiles').eq('id', 1);
    expect(mockSupabaseDb._queryTracker.conditions).toEqual([
      { column: 'id', operator: 'eq', value: 1 }
    ]);
  });

  it('neq() adds not-equal condition', () => {
    mockSupabaseDb.from('profiles').neq('id', 1);
    expect(mockSupabaseDb._queryTracker.conditions).toEqual([
      { column: 'id', operator: 'neq', value: 1 }
    ]);
  });

  it('gt() adds greater-than condition', () => {
    mockSupabaseDb.from('profiles').gt('id', 1);
    expect(mockSupabaseDb._queryTracker.conditions).toEqual([
      { column: 'id', operator: 'gt', value: 1 }
    ]);
  });

  it('gte() adds greater-than-or-equal condition', () => {
    mockSupabaseDb.from('profiles').gte('id', 1);
    expect(mockSupabaseDb._queryTracker.conditions).toEqual([
      { column: 'id', operator: 'gte', value: 1 }
    ]);
  });

  it('lt() adds less-than condition', () => {
    mockSupabaseDb.from('profiles').lt('id', 10);
    expect(mockSupabaseDb._queryTracker.conditions).toEqual([
      { column: 'id', operator: 'lt', value: 10 }
    ]);
  });

  it('lte() adds less-than-or-equal condition', () => {
    mockSupabaseDb.from('profiles').lte('id', 10);
    expect(mockSupabaseDb._queryTracker.conditions).toEqual([
      { column: 'id', operator: 'lte', value: 10 }
    ]);
  });

  it('like() adds LIKE condition', () => {
    mockSupabaseDb.from('profiles').like('name', '%test%');
    expect(mockSupabaseDb._queryTracker.conditions).toEqual([
      { column: 'name', operator: 'like', value: '%test%' }
    ]);
  });

  it('ilike() adds case-insensitive LIKE condition', () => {
    mockSupabaseDb.from('profiles').ilike('name', '%test%');
    expect(mockSupabaseDb._queryTracker.conditions).toEqual([
      { column: 'name', operator: 'ilike', value: '%test%' }
    ]);
  });

  it('in() adds IN condition', () => {
    mockSupabaseDb.from('profiles').in('id', [1, 2, 3]);
    expect(mockSupabaseDb._queryTracker.conditions).toEqual([
      { column: 'id', operator: 'in', value: [1, 2, 3] }
    ]);
  });

  it('order() sets the order by clause', () => {
    mockSupabaseDb.from('profiles').order('name');
    expect(mockSupabaseDb._queryTracker.orderBy).toEqual({
      column: 'name',
      ascending: true
    });
  });

  it('order() allows descending sort', () => {
    mockSupabaseDb.from('profiles').order('name', { ascending: false });
    expect(mockSupabaseDb._queryTracker.orderBy).toEqual({
      column: 'name',
      ascending: false
    });
  });

  it('limit() sets the limit value', () => {
    mockSupabaseDb.from('profiles').limit(10);
    expect(mockSupabaseDb._queryTracker.limit).toBe(10);
  });

  it('range() sets both offset and limit', () => {
    mockSupabaseDb.from('profiles').range(5, 15);
    expect(mockSupabaseDb._queryTracker.offset).toBe(5);
    expect(mockSupabaseDb._queryTracker.limit).toBe(11); // end - start + 1
  });

  it('single() returns the tracked response', () => {
    const mockResponse = { data: { id: 1 }, error: null };
    const result = mockSupabaseDb
      .from('profiles')
      .select()
      .eq('id', 1)
      .setMockResponse(mockResponse)
      .single();
    
    expect(result).toBe(mockResponse);
  });

  it('single() returns default empty response if none set', () => {
    const result = mockSupabaseDb
      .from('profiles')
      .select()
      .eq('id', 1)
      .single();
    
    expect(result).toEqual({ data: null, error: null });
  });

  it('setMockResponse() sets the response to be returned', () => {
    const mockResponse = { data: { id: 1 }, error: null };
    mockSupabaseDb.from('profiles').setMockResponse(mockResponse);
    expect(mockSupabaseDb._queryTracker.response).toBe(mockResponse);
  });

  it('resetMockSupabaseDb() resets the query tracker state', () => {
    // First set up some state
    mockSupabaseDb
      .from('profiles')
      .select()
      .eq('id', 1)
      .order('name')
      .limit(10)
      .setMockResponse({ data: { id: 1 }, error: null });
    
    // Then reset
    resetMockSupabaseDb();
    
    // Verify all state was reset
    expect(mockSupabaseDb._queryTracker.currentTable).toBeNull();
    expect(mockSupabaseDb._queryTracker.currentOperation).toBeNull();
    expect(mockSupabaseDb._queryTracker.currentParams).toEqual({});
    expect(mockSupabaseDb._queryTracker.conditions).toEqual([]);
    expect(mockSupabaseDb._queryTracker.orderBy).toBeNull();
    expect(mockSupabaseDb._queryTracker.limit).toBeNull();
    expect(mockSupabaseDb._queryTracker.offset).toBeNull();
    expect(mockSupabaseDb._queryTracker.response).toBeNull();
  });

  it('setupMockSupabaseDb() correctly mocks the supabaseClient module', () => {
    // Setup the mock
    setupMockSupabaseDb();
    
    // Import the mocked module
    const { supabase } = require('@/config/supabaseClient');
    
    // Verify the mock was correctly set up
    expect(supabase).toBe(mockSupabaseDb);
  });
}); 