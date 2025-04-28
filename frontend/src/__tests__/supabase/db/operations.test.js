import { createMockSupabase, mockSuccess, mockError, resetSupabaseMocks } from '../../helpers/supabaseMock';

describe('Supabase Database Operations', () => {
  let mockSupabase;

  beforeEach(() => {
    mockSupabase = createMockSupabase();
    resetSupabaseMocks(mockSupabase);
  });

  describe('Select Operations', () => {
    it('should perform a basic select query', async () => {
      const mockData = [{ id: 1, name: 'Test Item' }];
      mockSupabase.execute.mockResolvedValue(mockSuccess(mockData));

      const { data, error } = await mockSupabase
        .from('items')
        .select('*')
        .execute();

      expect(mockSupabase.from).toHaveBeenCalledWith('items');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(data).toEqual(mockData);
      expect(error).toBeNull();
    });

    it('should handle select with filters', async () => {
      const mockData = [{ id: 1, name: 'Filtered Item' }];
      mockSupabase.execute.mockResolvedValue(mockSuccess(mockData));

      const { data, error } = await mockSupabase
        .from('items')
        .select('*')
        .eq('category', 'test')
        .execute();

      expect(mockSupabase.eq).toHaveBeenCalledWith('category', 'test');
      expect(data).toEqual(mockData);
      expect(error).toBeNull();
    });

    it('should handle select errors', async () => {
      mockSupabase.execute.mockResolvedValue(mockError('Query failed'));

      const { data, error } = await mockSupabase
        .from('items')
        .select('*')
        .execute();

      expect(data).toBeNull();
      expect(error).toBeDefined();
      expect(error.message).toBe('Query failed');
    });
  });

  describe('Insert Operations', () => {
    it('should insert a new record', async () => {
      const newItem = { name: 'New Item' };
      const mockResponse = { id: 1, ...newItem };
      mockSupabase.execute.mockResolvedValue(mockSuccess([mockResponse]));

      const { data, error } = await mockSupabase
        .from('items')
        .insert(newItem)
        .execute();

      expect(mockSupabase.insert).toHaveBeenCalledWith(newItem);
      expect(data[0]).toEqual(mockResponse);
      expect(error).toBeNull();
    });

    it('should handle insert errors', async () => {
      const newItem = { name: 'New Item' };
      mockSupabase.execute.mockResolvedValue(mockError('Insert failed'));

      const { data, error } = await mockSupabase
        .from('items')
        .insert(newItem)
        .execute();

      expect(data).toBeNull();
      expect(error).toBeDefined();
      expect(error.message).toBe('Insert failed');
    });
  });

  describe('Update Operations', () => {
    it('should update an existing record', async () => {
      const updateData = { name: 'Updated Item' };
      const mockResponse = { id: 1, ...updateData };
      mockSupabase.execute.mockResolvedValue(mockSuccess([mockResponse]));

      const { data, error } = await mockSupabase
        .from('items')
        .update(updateData)
        .eq('id', 1)
        .execute();

      expect(mockSupabase.update).toHaveBeenCalledWith(updateData);
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 1);
      expect(data[0]).toEqual(mockResponse);
      expect(error).toBeNull();
    });

    it('should handle update errors', async () => {
      const updateData = { name: 'Updated Item' };
      mockSupabase.execute.mockResolvedValue(mockError('Update failed'));

      const { data, error } = await mockSupabase
        .from('items')
        .update(updateData)
        .eq('id', 1)
        .execute();

      expect(data).toBeNull();
      expect(error).toBeDefined();
      expect(error.message).toBe('Update failed');
    });
  });

  describe('Delete Operations', () => {
    it('should delete a record', async () => {
      mockSupabase.execute.mockResolvedValue(mockSuccess([]));

      const { data, error } = await mockSupabase
        .from('items')
        .delete()
        .eq('id', 1)
        .execute();

      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 1);
      expect(data).toEqual([]);
      expect(error).toBeNull();
    });

    it('should handle delete errors', async () => {
      mockSupabase.execute.mockResolvedValue(mockError('Delete failed'));

      const { data, error } = await mockSupabase
        .from('items')
        .delete()
        .eq('id', 1)
        .execute();

      expect(data).toBeNull();
      expect(error).toBeDefined();
      expect(error.message).toBe('Delete failed');
    });
  });
}); 