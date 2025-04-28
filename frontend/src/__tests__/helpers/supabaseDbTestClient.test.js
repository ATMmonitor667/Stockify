import { jest } from '@jest/globals';
import {
  mockSupabaseDb,
  resetMockSupabaseDb,
  mockSuccessfulResponse,
  mockErrorResponse,
  mockProfiles,
  mockPosts,
  mockStocks,
  mockUserStocks
} from './supabaseDbTestClient';

describe('Supabase Database Test Client', () => {
  beforeEach(() => {
    resetMockSupabaseDb();
  });

  describe('Mock Data', () => {
    it('should have valid mock profiles data', () => {
      expect(mockProfiles).toHaveLength(2);
      expect(mockProfiles[0]).toHaveProperty('user_id');
      expect(mockProfiles[0]).toHaveProperty('user_name');
      expect(mockProfiles[0]).toHaveProperty('wallet_amt');
    });

    it('should have valid mock posts data', () => {
      expect(mockPosts).toHaveLength(2);
      expect(mockPosts[0]).toHaveProperty('id');
      expect(mockPosts[0]).toHaveProperty('user_id');
      expect(mockPosts[0]).toHaveProperty('title');
      expect(mockPosts[0]).toHaveProperty('content');
    });

    it('should have valid mock stocks data', () => {
      expect(mockStocks).toHaveLength(2);
      expect(mockStocks[0]).toHaveProperty('id');
      expect(mockStocks[0]).toHaveProperty('symbol');
      expect(mockStocks[0]).toHaveProperty('name');
      expect(mockStocks[0]).toHaveProperty('current_price');
    });

    it('should have valid mock user stocks data', () => {
      expect(mockUserStocks).toHaveLength(2);
      expect(mockUserStocks[0]).toHaveProperty('id');
      expect(mockUserStocks[0]).toHaveProperty('user_id');
      expect(mockUserStocks[0]).toHaveProperty('stock_id');
      expect(mockUserStocks[0]).toHaveProperty('quantity');
      expect(mockUserStocks[0]).toHaveProperty('purchase_price');
    });
  });

  describe('Response Helpers', () => {
    it('should create successful response', () => {
      const data = { test: 'data' };
      const response = mockSuccessfulResponse(data);
      expect(response).toEqual({
        data,
        error: null
      });
    });

    it('should create error response', () => {
      const message = 'Test error';
      const response = mockErrorResponse(message);
      expect(response).toEqual({
        data: null,
        error: { message }
      });
    });
  });

  describe('Query Builder', () => {
    it('should build select query', () => {
      const response = { data: mockProfiles, error: null };
      const result = mockSupabaseDb
        .from('profiles')
        .select('*')
        .setMockResponse(response)
        .single();
      
      expect(result).toEqual(response);
    });

    it('should build insert query', () => {
      const newProfile = {
        user_id: 'test-user-3',
        user_name: 'Test User 3',
        wallet_amt: 20000.0
      };
      const response = mockSuccessfulResponse(newProfile);
      
      const result = mockSupabaseDb
        .from('profiles')
        .insert(newProfile)
        .setMockResponse(response)
        .single();
      
      expect(result).toEqual(response);
    });

    it('should build update query', () => {
      const updateData = { wallet_amt: 25000.0 };
      const response = mockSuccessfulResponse({ ...mockProfiles[0], ...updateData });
      
      const result = mockSupabaseDb
        .from('profiles')
        .update(updateData)
        .eq('user_id', mockProfiles[0].user_id)
        .setMockResponse(response)
        .single();
      
      expect(result).toEqual(response);
    });

    it('should build delete query', () => {
      const response = mockSuccessfulResponse(mockProfiles[0]);
      
      const result = mockSupabaseDb
        .from('profiles')
        .delete()
        .eq('user_id', mockProfiles[0].user_id)
        .setMockResponse(response)
        .single();
      
      expect(result).toEqual(response);
    });
  });

  describe('Query Conditions', () => {
    it('should handle eq condition', () => {
      mockSupabaseDb
        .from('profiles')
        .select()
        .eq('user_id', 'test-user-1');
      
      expect(mockSupabaseDb._queryTracker.conditions).toContainEqual({
        column: 'user_id',
        operator: 'eq',
        value: 'test-user-1'
      });
    });

    it('should handle neq condition', () => {
      mockSupabaseDb
        .from('profiles')
        .select()
        .neq('user_id', 'test-user-1');
      
      expect(mockSupabaseDb._queryTracker.conditions).toContainEqual({
        column: 'user_id',
        operator: 'neq',
        value: 'test-user-1'
      });
    });

    it('should handle gt condition', () => {
      mockSupabaseDb
        .from('profiles')
        .select()
        .gt('wallet_amt', 10000);
      
      expect(mockSupabaseDb._queryTracker.conditions).toContainEqual({
        column: 'wallet_amt',
        operator: 'gt',
        value: 10000
      });
    });

    it('should handle gte condition', () => {
      mockSupabaseDb
        .from('profiles')
        .select()
        .gte('wallet_amt', 10000);
      
      expect(mockSupabaseDb._queryTracker.conditions).toContainEqual({
        column: 'wallet_amt',
        operator: 'gte',
        value: 10000
      });
    });

    it('should handle lt condition', () => {
      mockSupabaseDb
        .from('profiles')
        .select()
        .lt('wallet_amt', 20000);
      
      expect(mockSupabaseDb._queryTracker.conditions).toContainEqual({
        column: 'wallet_amt',
        operator: 'lt',
        value: 20000
      });
    });

    it('should handle lte condition', () => {
      mockSupabaseDb
        .from('profiles')
        .select()
        .lte('wallet_amt', 20000);
      
      expect(mockSupabaseDb._queryTracker.conditions).toContainEqual({
        column: 'wallet_amt',
        operator: 'lte',
        value: 20000
      });
    });

    it('should handle like condition', () => {
      mockSupabaseDb
        .from('profiles')
        .select()
        .like('user_name', '%Test%');
      
      expect(mockSupabaseDb._queryTracker.conditions).toContainEqual({
        column: 'user_name',
        operator: 'like',
        value: '%Test%'
      });
    });

    it('should handle ilike condition', () => {
      mockSupabaseDb
        .from('profiles')
        .select()
        .ilike('user_name', '%test%');
      
      expect(mockSupabaseDb._queryTracker.conditions).toContainEqual({
        column: 'user_name',
        operator: 'ilike',
        value: '%test%'
      });
    });

    it('should handle in condition', () => {
      const values = ['test-user-1', 'test-user-2'];
      mockSupabaseDb
        .from('profiles')
        .select()
        .in('user_id', values);
      
      expect(mockSupabaseDb._queryTracker.conditions).toContainEqual({
        column: 'user_id',
        operator: 'in',
        value: values
      });
    });
  });

  describe('Query Modifiers', () => {
    it('should handle order modifier', () => {
      mockSupabaseDb
        .from('profiles')
        .select()
        .order('wallet_amt', { ascending: false });
      
      expect(mockSupabaseDb._queryTracker.orderBy).toEqual({
        column: 'wallet_amt',
        ascending: false
      });
    });

    it('should handle limit modifier', () => {
      mockSupabaseDb
        .from('profiles')
        .select()
        .limit(10);
      
      expect(mockSupabaseDb._queryTracker.limit).toBe(10);
    });

    it('should handle range modifier', () => {
      mockSupabaseDb
        .from('profiles')
        .select()
        .range(0, 9);
      
      expect(mockSupabaseDb._queryTracker.offset).toBe(0);
      expect(mockSupabaseDb._queryTracker.limit).toBe(10);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all query tracking', () => {
      mockSupabaseDb
        .from('profiles')
        .select()
        .eq('user_id', 'test-user-1')
        .order('wallet_amt')
        .limit(10);
      
      resetMockSupabaseDb();
      
      expect(mockSupabaseDb._queryTracker.currentTable).toBeNull();
      expect(mockSupabaseDb._queryTracker.currentOperation).toBeNull();
      expect(mockSupabaseDb._queryTracker.conditions).toHaveLength(0);
      expect(mockSupabaseDb._queryTracker.orderBy).toBeNull();
      expect(mockSupabaseDb._queryTracker.limit).toBeNull();
      expect(mockSupabaseDb._queryTracker.offset).toBeNull();
    });
  });
}); 