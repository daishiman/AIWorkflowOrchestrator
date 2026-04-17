import { describe, it, expect } from "vitest";
import {
  APPROVAL_CHANNELS,
  EXECUTION_CHANNELS,
  CHAT_EXPORT_CHANNELS,
  FILE_SYSTEM_CHANNELS,
  SKILL_CHANNELS,
  NOTIFICATION_CHANNELS,
  HISTORY_SEARCH_CHANNELS,
  SKILL_CREATOR_RUNTIME_CHANNELS,
  IPC_CHANNELS,
} from "../channels";

describe("APPROVAL_CHANNELS", () => {
  it('APPROVAL_RESPOND は "approval:respond"', () => {
    expect(APPROVAL_CHANNELS.APPROVAL_RESPOND).toBe("approval:respond");
  });

  it('APPROVAL_REQUEST は "approval:request"', () => {
    expect(APPROVAL_CHANNELS.APPROVAL_REQUEST).toBe("approval:request");
  });

  it("プロパティ数が 2 である", () => {
    expect(Object.keys(APPROVAL_CHANNELS)).toHaveLength(2);
  });
});

describe("EXECUTION_CHANNELS", () => {
  it('EXECUTION_GET_DISCLOSURE_INFO は "execution:get-disclosure-info"', () => {
    expect(EXECUTION_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO).toBe(
      "execution:get-disclosure-info",
    );
  });

  it('EXECUTION_GET_TERMINAL_LOG は "execution:get-terminal-log"', () => {
    expect(EXECUTION_CHANNELS.EXECUTION_GET_TERMINAL_LOG).toBe(
      "execution:get-terminal-log",
    );
  });

  it('EXECUTION_GET_COPY_COMMAND は "execution:get-copy-command"', () => {
    expect(EXECUTION_CHANNELS.EXECUTION_GET_COPY_COMMAND).toBe(
      "execution:get-copy-command",
    );
  });

  it("プロパティ数が 3 である", () => {
    expect(Object.keys(EXECUTION_CHANNELS)).toHaveLength(3);
  });
});

describe("SKILL_CREATOR_RUNTIME_CHANNELS", () => {
  it('SKILL_CREATOR_PROGRESS は "skill-creator:progress"', () => {
    expect(SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_PROGRESS).toBe(
      "skill-creator:progress",
    );
  });

  it('SKILL_CREATOR_CANCEL は "skill-creator:cancel"', () => {
    expect(SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_CANCEL).toBe(
      "skill-creator:cancel",
    );
  });

  it('SKILL_CREATOR_WORKFLOW_STATE_CHANGED は "skill-creator:workflow-state-changed"', () => {
    expect(
      SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
    ).toBe("skill-creator:workflow-state-changed");
  });

  it('SKILL_CREATOR_ADAPTER_STATUS_CHANGED は "skill-creator:adapter-status-changed"', () => {
    expect(
      SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
    ).toBe("skill-creator:adapter-status-changed");
  });

  it("プロパティ数が 4 である", () => {
    expect(Object.keys(SKILL_CREATOR_RUNTIME_CHANNELS)).toHaveLength(4);
  });
});

describe("channel separation", () => {
  it("APPROVAL_RESPOND と EXECUTION_GET_DISCLOSURE_INFO は異なるチャネル名", () => {
    expect(APPROVAL_CHANNELS.APPROVAL_RESPOND).not.toBe(
      EXECUTION_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO,
    );
  });

  it("APPROVAL_REQUEST と APPROVAL_RESPOND は異なるチャネル名", () => {
    expect(APPROVAL_CHANNELS.APPROVAL_REQUEST).not.toBe(
      APPROVAL_CHANNELS.APPROVAL_RESPOND,
    );
  });
});

describe("全チャネルが namespace:action 形式", () => {
  const allChannelGroups = [
    CHAT_EXPORT_CHANNELS,
    FILE_SYSTEM_CHANNELS,
    SKILL_CHANNELS,
    NOTIFICATION_CHANNELS,
    HISTORY_SEARCH_CHANNELS,
    SKILL_CREATOR_RUNTIME_CHANNELS,
    APPROVAL_CHANNELS,
    EXECUTION_CHANNELS,
  ];

  it("各チャネル値が colon 区切りの形式", () => {
    for (const group of allChannelGroups) {
      for (const value of Object.values(group)) {
        expect(value).toMatch(/^[a-zA-Z-]+:[a-zA-Z-]+(:[a-zA-Z-]+)*$/);
      }
    }
  });
});

describe("IPC_CHANNELS 統合オブジェクト", () => {
  it("APPROVAL_CHANNELS が IPC_CHANNELS に含まれる", () => {
    expect(IPC_CHANNELS.APPROVAL_RESPOND).toBe("approval:respond");
    expect(IPC_CHANNELS.APPROVAL_REQUEST).toBe("approval:request");
  });

  it("EXECUTION_CHANNELS が IPC_CHANNELS に含まれる", () => {
    expect(IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO).toBe(
      "execution:get-disclosure-info",
    );
    expect(IPC_CHANNELS.EXECUTION_GET_TERMINAL_LOG).toBe(
      "execution:get-terminal-log",
    );
    expect(IPC_CHANNELS.EXECUTION_GET_COPY_COMMAND).toBe(
      "execution:get-copy-command",
    );
  });

  it("SKILL_CREATOR_RUNTIME_CHANNELS が IPC_CHANNELS に含まれる", () => {
    expect(IPC_CHANNELS.SKILL_CREATOR_PROGRESS).toBe(
      SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_PROGRESS,
    );
    expect(IPC_CHANNELS.SKILL_CREATOR_CANCEL).toBe(
      SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_CANCEL,
    );
    expect(IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED).toBe(
      SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
    );
    expect(IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED).toBe(
      SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
    );
  });
});
