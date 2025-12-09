/**
 * Supabase Client Mock for Testing
 *
 * This file provides a mock implementation of the Supabase client
 * for use in unit tests of auth handlers.
 */

import { vi } from "vitest";

// Mock user data
export const mockUser = {
  id: "mock-user-id",
  email: "test@example.com",
  user_metadata: {
    name: "Test User",
    full_name: "Test User Full",
    avatar_url: "https://example.com/avatar.png",
  },
  app_metadata: {
    provider: "google",
    providers: ["google"],
  },
  created_at: "2024-01-01T00:00:00.000Z",
  last_sign_in_at: "2024-12-01T12:00:00.000Z",
  identities: [
    {
      id: "google-identity-id",
      provider: "google",
      identity_data: {
        email: "test@example.com",
        name: "Test User",
        avatar_url: "https://example.com/avatar.png",
      },
      created_at: "2024-01-01T00:00:00.000Z",
    },
  ],
};

// Mock session data
export const mockSession = {
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  expires_in: 3600,
  token_type: "bearer",
  user: mockUser,
};

// Mock auth methods
export const mockAuth = {
  signInWithOAuth: vi.fn().mockResolvedValue({
    data: { url: "https://accounts.google.com/oauth/authorize?..." },
    error: null,
  }),

  signOut: vi.fn().mockResolvedValue({
    error: null,
  }),

  getSession: vi.fn().mockResolvedValue({
    data: { session: mockSession },
    error: null,
  }),

  getUser: vi.fn().mockResolvedValue({
    data: { user: mockUser },
    error: null,
  }),

  setSession: vi.fn().mockResolvedValue({
    data: { session: mockSession, user: mockUser },
    error: null,
  }),

  refreshSession: vi.fn().mockResolvedValue({
    data: { session: mockSession, user: mockUser },
    error: null,
  }),

  onAuthStateChange: vi.fn().mockImplementation((callback) => {
    // Store callback for manual triggering in tests
    mockAuth._authStateChangeCallback = callback;
    return {
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    };
  }),

  // Internal property to store callback for test triggering
  _authStateChangeCallback: null as
    | ((event: string, session: typeof mockSession | null) => void)
    | null,
};

// Helper to trigger auth state change in tests
export const triggerAuthStateChange = (
  event: "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED" | "USER_UPDATED",
  session: typeof mockSession | null = mockSession,
) => {
  if (mockAuth._authStateChangeCallback) {
    mockAuth._authStateChangeCallback(event, session);
  }
};

// Mock Supabase client
export const createMockSupabaseClient = () => ({
  auth: mockAuth,
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: null,
      error: null,
    }),
  }),
  storage: {
    from: vi.fn().mockReturnValue({
      upload: vi
        .fn()
        .mockResolvedValue({ data: { path: "avatars/test.jpg" }, error: null }),
      download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
      remove: vi.fn().mockResolvedValue({ data: null, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({
        data: {
          publicUrl:
            "https://example.supabase.co/storage/v1/object/public/avatars/test.jpg",
        },
      }),
    }),
  },
});

// Reset all mocks
export const resetMocks = () => {
  vi.clearAllMocks();
  mockAuth.signInWithOAuth.mockResolvedValue({
    data: { url: "https://accounts.google.com/oauth/authorize?..." },
    error: null,
  });
  mockAuth.signOut.mockResolvedValue({ error: null });
  mockAuth.getSession.mockResolvedValue({
    data: { session: mockSession },
    error: null,
  });
  mockAuth.getUser.mockResolvedValue({
    data: { user: mockUser },
    error: null,
  });
  mockAuth.setSession.mockResolvedValue({
    data: { session: mockSession, user: mockUser },
    error: null,
  });
  mockAuth.refreshSession.mockResolvedValue({
    data: { session: mockSession, user: mockUser },
    error: null,
  });
};

export default createMockSupabaseClient;
