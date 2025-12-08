import { describe, it, expect, vi, beforeEach } from "vitest";
import { createClient } from "@supabase/supabase-js";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

// Need to import after mock
import { createSupabaseClient, resetSupabaseClient } from "./supabaseClient";

describe("supabaseClient", () => {
  const mockClient = { auth: {}, from: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    resetSupabaseClient();
    vi.mocked(createClient).mockReturnValue(
      mockClient as unknown as ReturnType<typeof createClient>,
    );
  });

  describe("createSupabaseClient", () => {
    it("should create Supabase client with provided URL and key", () => {
      const url = "https://example.supabase.co";
      const key = "test-anon-key";

      const client = createSupabaseClient(url, key);

      expect(createClient).toHaveBeenCalledWith(
        url,
        key,
        expect.objectContaining({
          auth: expect.objectContaining({
            persistSession: false,
            autoRefreshToken: true,
            detectSessionInUrl: false,
          }),
        }),
      );
      expect(client).toBe(mockClient);
    });

    it("should handle empty URL", () => {
      const client = createSupabaseClient("", "key");

      expect(createClient).toHaveBeenCalledWith("", "key", expect.any(Object));
      expect(client).toBe(mockClient);
    });

    it("should handle empty key", () => {
      const client = createSupabaseClient("https://example.supabase.co", "");

      expect(createClient).toHaveBeenCalledWith(
        "https://example.supabase.co",
        "",
        expect.any(Object),
      );
      expect(client).toBe(mockClient);
    });

    it("should create multiple independent clients", () => {
      const client1 = createSupabaseClient("url1", "key1");
      const client2 = createSupabaseClient("url2", "key2");

      expect(createClient).toHaveBeenCalledTimes(2);
      expect(client1).toBe(mockClient);
      expect(client2).toBe(mockClient);
    });
  });
});
