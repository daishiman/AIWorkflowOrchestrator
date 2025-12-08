import { describe, it, expect, vi, beforeEach } from "vitest";

// Create persistent mock store instance BEFORE mocking
const mockStoreInstance = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
};

vi.mock("electron", () => ({
  safeStorage: {
    isEncryptionAvailable: vi.fn(),
    encryptString: vi.fn(),
    decryptString: vi.fn(),
  },
}));

vi.mock("electron-store", () => {
  return {
    default: vi.fn(() => mockStoreInstance),
  };
});

// Import AFTER mocks are set up
import { safeStorage } from "electron";
import { createSecureStorage, clearSecureStore } from "./secureStorage";

describe("secureStorage", () => {
  beforeEach(() => {
    // Reset mock implementations but keep the mock functions
    mockStoreInstance.get.mockReset();
    mockStoreInstance.set.mockReset();
    mockStoreInstance.delete.mockReset();
    mockStoreInstance.clear.mockReset();
    vi.mocked(safeStorage.isEncryptionAvailable).mockReset();
    vi.mocked(safeStorage.encryptString).mockReset();
    vi.mocked(safeStorage.decryptString).mockReset();
  });

  describe("createSecureStorage", () => {
    it("should return SecureStorage interface", () => {
      const storage = createSecureStorage();

      expect(storage).toHaveProperty("storeRefreshToken");
      expect(storage).toHaveProperty("getRefreshToken");
      expect(storage).toHaveProperty("clearTokens");
    });
  });

  describe("storeRefreshToken", () => {
    it("should encrypt and store token when encryption is available", async () => {
      const storage = createSecureStorage();
      const token = "test-refresh-token";
      const encryptedBuffer = Buffer.from("encrypted-data");

      vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(true);
      vi.mocked(safeStorage.encryptString).mockReturnValue(encryptedBuffer);

      await storage.storeRefreshToken(token);

      expect(safeStorage.encryptString).toHaveBeenCalledWith(token);
      expect(mockStoreInstance.set).toHaveBeenCalledWith(
        "encryptedRefreshToken",
        encryptedBuffer.toString("base64"),
      );
    });

    it("should store token in plain text when encryption is not available", async () => {
      const storage = createSecureStorage();
      const token = "test-refresh-token";

      vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(false);

      await storage.storeRefreshToken(token);

      expect(safeStorage.encryptString).not.toHaveBeenCalled();
      expect(mockStoreInstance.set).toHaveBeenCalledWith(
        "encryptedRefreshToken",
        token,
      );
    });

    it("should handle empty token", async () => {
      const storage = createSecureStorage();
      const encryptedBuffer = Buffer.from("");

      vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(true);
      vi.mocked(safeStorage.encryptString).mockReturnValue(encryptedBuffer);

      await storage.storeRefreshToken("");

      expect(safeStorage.encryptString).toHaveBeenCalledWith("");
    });

    it("should throw error on store failure", async () => {
      const storage = createSecureStorage();

      vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(true);
      vi.mocked(safeStorage.encryptString).mockReturnValue(
        Buffer.from("encrypted"),
      );
      mockStoreInstance.set.mockImplementation(() => {
        throw new Error("Store error");
      });

      await expect(storage.storeRefreshToken("token")).rejects.toThrow(
        "Store error",
      );
    });
  });

  describe("getRefreshToken", () => {
    it("should decrypt and return token when encryption is available", async () => {
      const storage = createSecureStorage();
      const encryptedBase64 = Buffer.from("encrypted-data").toString("base64");
      const decryptedToken = "test-refresh-token";

      mockStoreInstance.get.mockReturnValue(encryptedBase64);
      vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(true);
      vi.mocked(safeStorage.decryptString).mockReturnValue(decryptedToken);

      const result = await storage.getRefreshToken();

      expect(mockStoreInstance.get).toHaveBeenCalledWith(
        "encryptedRefreshToken",
      );
      expect(safeStorage.decryptString).toHaveBeenCalledWith(
        Buffer.from(encryptedBase64, "base64"),
      );
      expect(result).toBe(decryptedToken);
    });

    it("should return plain text token when encryption is not available", async () => {
      const storage = createSecureStorage();
      const token = "plain-text-token";

      mockStoreInstance.get.mockReturnValue(token);
      vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(false);

      const result = await storage.getRefreshToken();

      expect(safeStorage.decryptString).not.toHaveBeenCalled();
      expect(result).toBe(token);
    });

    it("should return null when no token is stored", async () => {
      const storage = createSecureStorage();

      mockStoreInstance.get.mockReturnValue(undefined);

      const result = await storage.getRefreshToken();

      expect(result).toBeNull();
    });

    it("should return null on decryption error", async () => {
      const storage = createSecureStorage();

      mockStoreInstance.get.mockReturnValue("encrypted-data");
      vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(true);
      vi.mocked(safeStorage.decryptString).mockImplementation(() => {
        throw new Error("Decryption failed");
      });

      const result = await storage.getRefreshToken();

      expect(result).toBeNull();
    });
  });

  describe("clearTokens", () => {
    it("should delete refresh token from store", async () => {
      const storage = createSecureStorage();

      await storage.clearTokens();

      expect(mockStoreInstance.delete).toHaveBeenCalledWith(
        "encryptedRefreshToken",
      );
    });

    it("should throw error on delete failure", async () => {
      const storage = createSecureStorage();

      mockStoreInstance.delete.mockImplementation(() => {
        throw new Error("Delete error");
      });

      await expect(storage.clearTokens()).rejects.toThrow("Delete error");
    });
  });

  describe("clearSecureStore", () => {
    it("should clear the entire store", () => {
      clearSecureStore();

      expect(mockStoreInstance.clear).toHaveBeenCalled();
    });
  });
});
