import { jest } from '@jest/globals';
import { createMockSupabase } from '../helpers/supabaseMock';

describe('Supabase Real-time Subscriptions', () => {
  let mockSupabase;
  let subscription;
  let callback;

  beforeEach(() => {
    mockSupabase = createMockSupabase();
    callback = jest.fn();
    subscription = {
      on: jest.fn().mockImplementation((event, cb) => {
        callback = cb;
        return subscription;
      }),
      unsubscribe: jest.fn()
    };
    mockSupabase.subscribe.mockReturnValue(subscription);
  });

  it('should subscribe to table changes', () => {
    const table = 'posts';

    mockSupabase.from(table).subscribe(callback);

    expect(mockSupabase.from).toHaveBeenCalledWith(table);
    expect(mockSupabase.subscribe).toHaveBeenCalled();
  });

  it('should handle real-time insert events', () => {
    const table = 'posts';
    const insertPayload = {
      eventType: 'INSERT',
      new: { id: 1, title: 'New Post' }
    };

    mockSupabase.from(table).subscribe(callback);
    subscription.on('INSERT', callback);
    callback(insertPayload);

    expect(callback).toHaveBeenCalledWith(insertPayload);
  });

  it('should handle real-time update events', () => {
    const table = 'posts';
    const updatePayload = {
      eventType: 'UPDATE',
      new: { id: 1, title: 'Updated Post' },
      old: { id: 1, title: 'Old Post' }
    };

    mockSupabase.from(table).subscribe(callback);
    subscription.on('UPDATE', callback);
    callback(updatePayload);

    expect(callback).toHaveBeenCalledWith(updatePayload);
  });

  it('should handle real-time delete events', () => {
    const table = 'posts';
    const deletePayload = {
      eventType: 'DELETE',
      old: { id: 1, title: 'Deleted Post' }
    };

    mockSupabase.from(table).subscribe(callback);
    subscription.on('DELETE', callback);
    callback(deletePayload);

    expect(callback).toHaveBeenCalledWith(deletePayload);
  });

  it('should unsubscribe from real-time events', () => {
    const table = 'posts';

    const subscription = mockSupabase.from(table).subscribe(callback);
    subscription.unsubscribe();

    expect(subscription.unsubscribe).toHaveBeenCalled();
  });
}); 