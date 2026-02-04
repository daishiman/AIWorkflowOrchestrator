/**
 * @file supabase-client.test.ts
 * @description toLinkedProvider関数のユニットテスト
 *
 * AUTH-UI-004: Googleアバター取得修正
 * プロバイダーごとのアバターURLキー名の違いをテスト
 */

import { describe, it, expect } from "vitest";
import { toLinkedProvider } from "../supabase-client";
import type { SupabaseIdentity } from "../../../types/auth";

describe("toLinkedProvider", () => {
  describe("avatarUrl extraction", () => {
    it("GAV-01: should extract picture for Google provider", () => {
      const identity: SupabaseIdentity = {
        id: "123",
        provider: "google",
        identity_data: {
          email: "test@gmail.com",
          name: "Test User",
          picture: "https://lh3.googleusercontent.com/a/photo",
        },
        created_at: "2024-01-01T00:00:00Z",
      };

      const result = toLinkedProvider(identity);

      expect(result.avatarUrl).toBe(
        "https://lh3.googleusercontent.com/a/photo",
      );
      expect(result.provider).toBe("google");
      expect(result.email).toBe("test@gmail.com");
      expect(result.displayName).toBe("Test User");
    });

    it("GAV-02: should extract avatar_url for GitHub provider", () => {
      const identity: SupabaseIdentity = {
        id: "456",
        provider: "github",
        identity_data: {
          email: "test@github.com",
          name: "Test User",
          avatar_url: "https://avatars.githubusercontent.com/u/123",
        },
        created_at: "2024-01-01T00:00:00Z",
      };

      const result = toLinkedProvider(identity);

      expect(result.avatarUrl).toBe(
        "https://avatars.githubusercontent.com/u/123",
      );
      expect(result.provider).toBe("github");
    });

    it("GAV-03: should extract avatar_url for Discord provider", () => {
      const identity: SupabaseIdentity = {
        id: "789",
        provider: "discord",
        identity_data: {
          email: "test@discord.com",
          name: "Discord User",
          avatar_url: "https://cdn.discordapp.com/avatars/123/avatar.png",
        },
        created_at: "2024-01-01T00:00:00Z",
      };

      const result = toLinkedProvider(identity);

      expect(result.avatarUrl).toBe(
        "https://cdn.discordapp.com/avatars/123/avatar.png",
      );
      expect(result.provider).toBe("discord");
    });

    it("GAV-04: should prefer avatar_url when both exist", () => {
      const identity: SupabaseIdentity = {
        id: "789",
        provider: "test",
        identity_data: {
          avatar_url: "https://avatar-url.example.com",
          picture: "https://picture.example.com",
        },
        created_at: "2024-01-01T00:00:00Z",
      };

      const result = toLinkedProvider(identity);

      expect(result.avatarUrl).toBe("https://avatar-url.example.com");
    });

    it("GAV-05: should return null when neither exists", () => {
      const identity: SupabaseIdentity = {
        id: "101",
        provider: "test",
        identity_data: {
          email: "test@example.com",
        },
        created_at: "2024-01-01T00:00:00Z",
      };

      const result = toLinkedProvider(identity);

      expect(result.avatarUrl).toBeNull();
    });

    it("GAV-06: should return null when identity_data is undefined", () => {
      const identity: SupabaseIdentity = {
        id: "102",
        provider: "test",
        created_at: "2024-01-01T00:00:00Z",
      };

      const result = toLinkedProvider(identity);

      expect(result.avatarUrl).toBeNull();
      expect(result.email).toBe("");
      expect(result.displayName).toBeNull();
    });
  });

  describe("other fields extraction", () => {
    it("should extract providerId from identity.id", () => {
      const identity: SupabaseIdentity = {
        id: "unique-provider-id-123",
        provider: "google",
        identity_data: {},
        created_at: "2024-01-01T00:00:00Z",
      };

      const result = toLinkedProvider(identity);

      expect(result.providerId).toBe("unique-provider-id-123");
    });

    it("should extract linkedAt from identity.created_at", () => {
      const identity: SupabaseIdentity = {
        id: "123",
        provider: "google",
        identity_data: {},
        created_at: "2024-06-15T10:30:00Z",
      };

      const result = toLinkedProvider(identity);

      expect(result.linkedAt).toBe("2024-06-15T10:30:00Z");
    });
  });
});
