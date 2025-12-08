import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { UserProfile } from "@repo/shared/types/auth";

// Create persistent mock store instance BEFORE mocking
const mockStoreInstance = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
};

vi.mock("electron-store", () => {
  return {
    default: vi.fn(() => mockStoreInstance),
  };
});

// Import AFTER mocks are set up
import {
  createProfileCache,
  clearProfileCache,
  getCacheTTL,
} from "./profileCache";

const mockProfile: UserProfile = {
  id: "user-123",
  displayName: "Test User",
  email: "test@example.com",
  avatarUrl: "https://example.com/avatar.jpg",
  plan: "free",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-12-01T00:00:00Z",
};

describe("profileCache", () => {
  beforeEach(() => {
    mockStoreInstance.get.mockReset();
    mockStoreInstance.set.mockReset();
    mockStoreInstance.delete.mockReset();
    mockStoreInstance.clear.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-12-01T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("createProfileCache", () => {
    it("should return ProfileCache interface", () => {
      const cache = createProfileCache();

      expect(cache).toHaveProperty("getCachedProfile");
      expect(cache).toHaveProperty("updateCachedProfile");
    });
  });

  describe("getCachedProfile", () => {
    it("should return cached profile when valid", async () => {
      const cache = createProfileCache();
      const recentTimestamp = Date.now() - 1000; // 1 second ago

      mockStoreInstance.get.mockImplementation((key: string) => {
        if (key === "cachedProfile") return mockProfile;
        if (key === "cachedAt") return recentTimestamp;
        return undefined;
      });

      const result = await cache.getCachedProfile();

      expect(mockStoreInstance.get).toHaveBeenCalledWith("cachedProfile");
      expect(result).toEqual(mockProfile);
    });

    it("should return null when no profile is cached", async () => {
      const cache = createProfileCache();

      mockStoreInstance.get.mockReturnValue(undefined);

      const result = await cache.getCachedProfile();

      expect(result).toBeNull();
    });

    it("should return stale profile with warning when cache is expired", async () => {
      const cache = createProfileCache();
      const expiredTimestamp = Date.now() - getCacheTTL() - 1000; // TTL + 1 second ago

      mockStoreInstance.get.mockImplementation((key: string) => {
        if (key === "cachedProfile") return mockProfile;
        if (key === "cachedAt") return expiredTimestamp;
        return undefined;
      });

      // Spy on console.warn
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = await cache.getCachedProfile();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Cache expired"),
      );
      expect(result).toEqual(mockProfile);

      warnSpy.mockRestore();
    });

    it("should return null on error", async () => {
      const cache = createProfileCache();

      mockStoreInstance.get.mockImplementation(() => {
        throw new Error("Store error");
      });

      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await cache.getCachedProfile();

      expect(result).toBeNull();
      expect(errorSpy).toHaveBeenCalled();

      errorSpy.mockRestore();
    });

    it("should handle profile with null avatarUrl", async () => {
      const cache = createProfileCache();
      const profileWithNullAvatar = { ...mockProfile, avatarUrl: null };

      mockStoreInstance.get.mockImplementation((key: string) => {
        if (key === "cachedProfile") return profileWithNullAvatar;
        if (key === "cachedAt") return Date.now() - 1000;
        return undefined;
      });

      const result = await cache.getCachedProfile();

      expect(result?.avatarUrl).toBeNull();
    });
  });

  describe("updateCachedProfile", () => {
    it("should store profile with current timestamp", async () => {
      const cache = createProfileCache();

      await cache.updateCachedProfile(mockProfile);

      expect(mockStoreInstance.set).toHaveBeenCalledWith(
        "cachedProfile",
        mockProfile,
      );
      expect(mockStoreInstance.set).toHaveBeenCalledWith(
        "cachedAt",
        Date.now(),
      );
    });

    it("should not throw on store error", async () => {
      const cache = createProfileCache();

      mockStoreInstance.set.mockImplementation(() => {
        throw new Error("Store error");
      });

      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      // Should not throw
      await cache.updateCachedProfile(mockProfile);

      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });

    it("should handle profile with null fields", async () => {
      const cache = createProfileCache();
      const profileWithNulls = { ...mockProfile, avatarUrl: null };

      await cache.updateCachedProfile(profileWithNulls);

      expect(mockStoreInstance.set).toHaveBeenCalledWith(
        "cachedProfile",
        profileWithNulls,
      );
    });
  });

  describe("clearProfileCache", () => {
    it("should clear the store", () => {
      clearProfileCache();

      expect(mockStoreInstance.clear).toHaveBeenCalled();
    });
  });

  describe("getCacheTTL", () => {
    it("should return 24 hours in milliseconds", () => {
      const ttl = getCacheTTL();

      expect(ttl).toBe(24 * 60 * 60 * 1000);
    });
  });

  describe("edge cases", () => {
    it("should handle rapid successive reads", async () => {
      const cache = createProfileCache();

      mockStoreInstance.get.mockImplementation((key: string) => {
        if (key === "cachedProfile") return mockProfile;
        if (key === "cachedAt") return Date.now() - 1000;
        return undefined;
      });

      const results = await Promise.all(
        Array(10)
          .fill(null)
          .map(() => cache.getCachedProfile()),
      );

      expect(results).toHaveLength(10);
      results.forEach((result) => expect(result).toEqual(mockProfile));
    });

    it("should handle rapid successive writes", async () => {
      const cache = createProfileCache();

      await Promise.all(
        Array(10)
          .fill(null)
          .map((_, i) =>
            cache.updateCachedProfile({
              ...mockProfile,
              displayName: `User ${i}`,
            }),
          ),
      );

      expect(mockStoreInstance.set).toHaveBeenCalledTimes(20); // 10 profiles + 10 timestamps
    });
  });
});
