# Phase 2 成果物: バリデーションマトリクス

## タスクID: UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001

## TC-01〜TC-09 テストケース設計

| TC ID | テスト対象ファイル                                                           | テスト内容                                               | 期待状態（Phase 5後） |
| ----- | ---------------------------------------------------------------------------- | -------------------------------------------------------- | --------------------- |
| TC-01 | `packages/shared/src/ipc/__tests__/channels.test.ts`                         | SKILL_CREATOR_PROGRESS の文字列値検証                    | PASS                  |
| TC-02 | `packages/shared/src/ipc/__tests__/channels.test.ts`                         | SKILL_CREATOR_WORKFLOW_STATE_CHANGED の文字列値検証      | PASS                  |
| TC-03 | `packages/shared/src/ipc/__tests__/channels.test.ts`                         | SKILL_CREATOR_ADAPTER_STATUS_CHANGED の文字列値検証      | PASS                  |
| TC-04 | `packages/shared/src/ipc/__tests__/channels.test.ts`                         | IPC_CHANNELS.SKILL_CREATOR_PROGRESS の shared 値との一致 | PASS                  |
| TC-05 | `packages/shared/src/ipc/__tests__/channels.test.ts`                         | IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED の一致 | PASS                  |
| TC-06 | `packages/shared/src/ipc/__tests__/channels.test.ts`                         | IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED の一致 | PASS                  |
| TC-07 | `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` | preload SKILL_CREATOR_PROGRESS の parity 検証            | PASS                  |
| TC-08 | `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` | preload SKILL_CREATOR_WORKFLOW_STATE_CHANGED の parity   | PASS                  |
| TC-09 | `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` | preload SKILL_CREATOR_ADAPTER_STATUS_CHANGED の parity   | PASS                  |

## テスト疑似コード

### TC-01〜TC-03: SKILL_CREATOR_RUNTIME_CHANNELS 値検証

```typescript
describe("SKILL_CREATOR_RUNTIME_CHANNELS", () => {
  it('SKILL_CREATOR_PROGRESS は "skill-creator:progress"', () => {
    expect(SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_PROGRESS).toBe(
      "skill-creator:progress",
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
});
```

### TC-04〜TC-06: IPC_CHANNELS スプレッド検証

```typescript
it("SKILL_CREATOR_RUNTIME_CHANNELS が IPC_CHANNELS に含まれる", () => {
  expect(IPC_CHANNELS.SKILL_CREATOR_PROGRESS).toBe(
    SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_PROGRESS,
  );
  expect(IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED).toBe(
    SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
  );
  expect(IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED).toBe(
    SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
  );
});
```

### TC-07〜TC-09: cross-layer parity テスト

```typescript
describe("skill creator runtime channel parity", () => {
  it("shared の runtime channel 正本と preload の IPC_CHANNELS が一致する", async () => {
    const { IPC_CHANNELS } = await import("../../../../preload/channels");
    expect(IPC_CHANNELS.SKILL_CREATOR_PROGRESS).toBe(
      SHARED_IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
    );
    expect(IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED).toBe(
      SHARED_IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
    );
    expect(IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED).toBe(
      SHARED_IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
    );
  });
});
```
