import { describe, it, expect } from "vitest";
import {
  IPC_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
  ALLOWED_ON_CHANNELS,
} from "../channels";

describe("TASK-UI-01: channels拡張", () => {
  it("notification/historySearchチャネル定数が定義される", () => {
    expect(IPC_CHANNELS.NOTIFICATION_GET_HISTORY).toBe(
      "notification:get-history",
    );
    expect(IPC_CHANNELS.NOTIFICATION_MARK_READ).toBe("notification:mark-read");
    expect(IPC_CHANNELS.NOTIFICATION_MARK_ALL_READ).toBe(
      "notification:mark-all-read",
    );
    expect(IPC_CHANNELS.NOTIFICATION_DELETE).toBe("notification:delete");
    expect(IPC_CHANNELS.NOTIFICATION_CLEAR).toBe("notification:clear");
    expect(IPC_CHANNELS.NOTIFICATION_NEW).toBe("notification:new");
    expect(IPC_CHANNELS.HISTORY_SEARCH).toBe("history:search");
    expect(IPC_CHANNELS.HISTORY_GET_STATS).toBe("history:get-stats");
  });

  it("invoke allowlistに含まれる", () => {
    expect(ALLOWED_INVOKE_CHANNELS).toContain(
      IPC_CHANNELS.NOTIFICATION_GET_HISTORY,
    );
    expect(ALLOWED_INVOKE_CHANNELS).toContain(
      IPC_CHANNELS.NOTIFICATION_MARK_READ,
    );
    expect(ALLOWED_INVOKE_CHANNELS).toContain(
      IPC_CHANNELS.NOTIFICATION_MARK_ALL_READ,
    );
    expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.NOTIFICATION_DELETE);
    expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.NOTIFICATION_CLEAR);
    expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.HISTORY_SEARCH);
    expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.HISTORY_GET_STATS);
  });

  it("on allowlistにnotification:newのみ含まれる", () => {
    expect(ALLOWED_ON_CHANNELS).toContain(IPC_CHANNELS.NOTIFICATION_NEW);
    expect(ALLOWED_ON_CHANNELS).not.toContain(
      IPC_CHANNELS.NOTIFICATION_GET_HISTORY,
    );
    expect(ALLOWED_ON_CHANNELS).not.toContain(IPC_CHANNELS.HISTORY_SEARCH);
  });
});
