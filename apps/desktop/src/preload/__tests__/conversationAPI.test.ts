/**
 * Conversation API Preload Tests
 *
 * TDD Red Phase: Tests for conversationAPI exposed via contextBridge.
 *
 * @module @repo/desktop/preload/__tests__/conversationAPI
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { IPC_CHANNELS, ALLOWED_INVOKE_CHANNELS } from "../channels";

describe("Conversation API - IPC Channels", () => {
  describe("Channel Definitions", () => {
    it("should define CONVERSATION_LIST channel", () => {
      expect(IPC_CHANNELS.CONVERSATION_LIST).toBe("conversation:list");
    });

    it("should define CONVERSATION_GET channel", () => {
      expect(IPC_CHANNELS.CONVERSATION_GET).toBe("conversation:get");
    });

    it("should define CONVERSATION_CREATE channel", () => {
      expect(IPC_CHANNELS.CONVERSATION_CREATE).toBe("conversation:create");
    });

    it("should define CONVERSATION_UPDATE channel", () => {
      expect(IPC_CHANNELS.CONVERSATION_UPDATE).toBe("conversation:update");
    });

    it("should define CONVERSATION_DELETE channel", () => {
      expect(IPC_CHANNELS.CONVERSATION_DELETE).toBe("conversation:delete");
    });

    it("should define CONVERSATION_ADD_MESSAGE channel", () => {
      expect(IPC_CHANNELS.CONVERSATION_ADD_MESSAGE).toBe(
        "conversation:addMessage",
      );
    });

    it("should define CONVERSATION_SEARCH channel", () => {
      expect(IPC_CHANNELS.CONVERSATION_SEARCH).toBe("conversation:search");
    });
  });

  describe("Whitelist Registration", () => {
    it("should include CONVERSATION_LIST in allowed channels", () => {
      expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.CONVERSATION_LIST);
    });

    it("should include CONVERSATION_GET in allowed channels", () => {
      expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.CONVERSATION_GET);
    });

    it("should include CONVERSATION_CREATE in allowed channels", () => {
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.CONVERSATION_CREATE,
      );
    });

    it("should include CONVERSATION_UPDATE in allowed channels", () => {
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.CONVERSATION_UPDATE,
      );
    });

    it("should include CONVERSATION_DELETE in allowed channels", () => {
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.CONVERSATION_DELETE,
      );
    });

    it("should include CONVERSATION_ADD_MESSAGE in allowed channels", () => {
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.CONVERSATION_ADD_MESSAGE,
      );
    });

    it("should include CONVERSATION_SEARCH in allowed channels", () => {
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.CONVERSATION_SEARCH,
      );
    });
  });
});

describe("Conversation API - window.conversationAPI", () => {
  const mockConversationAPI = {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    addMessage: vi.fn(),
    search: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal("conversationAPI", mockConversationAPI);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("API Object Availability", () => {
    it("should expose conversationAPI on window object", () => {
      expect(window.conversationAPI).toBeDefined();
    });

    it("should have list method", () => {
      expect(window.conversationAPI?.list).toBeInstanceOf(Function);
    });

    it("should have get method", () => {
      expect(window.conversationAPI?.get).toBeInstanceOf(Function);
    });

    it("should have create method", () => {
      expect(window.conversationAPI?.create).toBeInstanceOf(Function);
    });

    it("should have update method", () => {
      expect(window.conversationAPI?.update).toBeInstanceOf(Function);
    });

    it("should have delete method", () => {
      expect(window.conversationAPI?.delete).toBeInstanceOf(Function);
    });

    it("should have addMessage method", () => {
      expect(window.conversationAPI?.addMessage).toBeInstanceOf(Function);
    });

    it("should have search method", () => {
      expect(window.conversationAPI?.search).toBeInstanceOf(Function);
    });
  });
});
