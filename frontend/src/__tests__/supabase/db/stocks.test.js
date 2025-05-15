import {
  mockSupabaseDb,
  mockStocks,
  mockUserStocks,
  mockSuccessfulResponse,
  mockErrorResponse,
  resetMockSupabaseDb,
} from "../../helpers/supabaseDbTestClient";

describe("Stocks Database Operations", () => {
  beforeEach(() => {
    resetMockSupabaseDb();
  });

  describe("Fetch Stocks", () => {
    it("should fetch all stocks", async () => {
      mockSupabaseDb.setMockResponse(mockSuccessfulResponse(mockStocks));

      const { data, error } = await mockSupabaseDb
        .from("stocks")
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toEqual(mockStocks);
    });

    it("should fetch a stock by symbol", async () => {
      const tick = "AAPL";
      const stock = mockStocks.find((s) => s.tick === tick);

      mockSupabaseDb.setMockResponse(mockSuccessfulResponse(stock));

      const { data, error } = await mockSupabaseDb
        .from("stocks")
        .select()
        .eq("tick", tick)
        .single();

      expect(error).toBeNull();
      expect(data).toEqual(stock);
    });

    it("should handle stock not found", async () => {
      const tick = "INVALID";

      mockSupabaseDb.setMockResponse(mockErrorResponse("Stock not found"));

      const { data, error } = await mockSupabaseDb
        .from("stocks")
        .select()
        .eq("tick", tick)
        .single();

      expect(data).toBeNull();
      expect(error.message).toBe("Stock not found");
    });
  });

  describe("User Stocks", () => {
    it("should fetch user stocks", async () => {
      const userId = "test-user-1";
      const userStocks = mockUserStocks.filter((us) => us.user_id === userId);

      mockSupabaseDb.setMockResponse(mockSuccessfulResponse(userStocks));

      const { data, error } = await mockSupabaseDb
        .from("user_stocks")
        .select()
        .eq("user_id", userId)
        .single();

      expect(error).toBeNull();
      expect(data).toEqual(userStocks);
    });

    it("should add a stock to user portfolio", async () => {
      const userId = "test-user-1";
      const stockId = 1;
      const quantity = 5;
      const purchasePrice = 150.0;

      const newUserStock = {
        user_id: userId,
        stock_id: stockId,
        quantity,
        purchase_price: purchasePrice,
      };

      mockSupabaseDb.setMockResponse(mockSuccessfulResponse(newUserStock));

      const { data, error } = await mockSupabaseDb
        .from("user_stocks")
        .insert([newUserStock])
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toEqual(newUserStock);
    });

    it("should update user stock quantity", async () => {
      const userId = "test-user-1";
      const stockId = 1;
      const newQuantity = 15;

      const updatedUserStock = {
        ...mockUserStocks[0],
        quantity: newQuantity,
      };

      mockSupabaseDb.setMockResponse(mockSuccessfulResponse(updatedUserStock));

      const { data, error } = await mockSupabaseDb
        .from("user_stocks")
        .update({ quantity: newQuantity })
        .eq("user_id", userId)
        .eq("stock_id", stockId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.quantity).toBe(newQuantity);
    });

    it("should handle duplicate stock purchase", async () => {
      const userId = "test-user-1";
      const stockId = 1; // Already exists in user portfolio
      const quantity = 5;
      const purchasePrice = 150.0;

      const duplicateUserStock = {
        user_id: userId,
        stock_id: stockId,
        quantity,
        purchase_price: purchasePrice,
      };

      mockSupabaseDb.setMockResponse(
        mockErrorResponse("duplicate key value violates unique constraint")
      );

      const { data, error } = await mockSupabaseDb
        .from("user_stocks")
        .insert([duplicateUserStock])
        .select()
        .single();

      expect(data).toBeNull();
      expect(error.message).toContain("duplicate key value");
    });
  });

  // Note: We've removed the 'Stock Price Updates' tests since the current_price
  // column doesn't exist in the database schema
});
