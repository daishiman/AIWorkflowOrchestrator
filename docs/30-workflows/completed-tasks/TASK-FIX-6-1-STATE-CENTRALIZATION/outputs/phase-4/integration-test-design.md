# Phase 4: 統合テスト設計

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| タスクID | TASK-FIX-6-1-STATE-CENTRALIZATION |
| Phase    | 4                                 |
| 作成日   | 2026-02-09                        |

---

## 1. 統合テスト概要

### 1.1 目的

skillSlice から agentSlice への状態統合において、コンポーネント間の連携が正しく機能することを検証する。

### 1.2 テスト対象範囲

```
統合テスト範囲:
┌─────────────────────────────────────────────────────────┐
│ Renderer Process                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ React Components                                     │ │
│ │ └── useSkillExecution Hook                           │ │
│ └─────────────────────────────────────────────────────┘ │
│                          ↓                               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Zustand Store                                        │ │
│ │ ├── agentSlice (統合後)                              │ │
│ │ │   ├── 既存の Agent 状態                            │ │
│ │ │   └── 統合された Skill 状態 ← NEW                  │ │
│ │ └── skillSlice (統合元 - 移行後削除)                 │ │
│ └─────────────────────────────────────────────────────┘ │
│                          ↓                               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ IPC Bridge (Preload)                                 │ │
│ │ └── electronAPI.skill.*                              │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ Main Process (Mocked)                                    │
│ └── skill:* IPC handlers                                │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 統合テストシナリオ

### 2.1 シナリオカテゴリ

| カテゴリID | カテゴリ名              | 検証内容                                        |
| ---------- | ----------------------- | ----------------------------------------------- |
| INT-01     | 状態統合シナリオ        | skillSlice 状態が agentSlice に正しく統合される |
| INT-02     | アクション移行シナリオ  | skillSlice アクションが agentSlice で動作する   |
| INT-03     | race condition シナリオ | executionId 事前生成による競合回避が機能する    |
| INT-04     | IPC リスナーシナリオ    | ストリーミングメッセージ受信が正しく処理される  |
| INT-05     | 既存機能共存シナリオ    | 統合後も既存の agentSlice 機能が正常に動作する  |

### 2.2 INT-01: 状態統合シナリオ

#### 目的

skillSlice の状態が agentSlice に正しく統合され、一元管理されることを検証する。

#### テストシナリオ

```typescript
describe("INT-01: 状態統合シナリオ", () => {
  it("INT-01-1: skillSlice の状態が agentSlice に統合される", async () => {
    // Arrange
    const store = useStore.getState();
    setupMockElectronAPI({
      skillList: mockAvailableSkills,
      skillGetImported: mockImportedSkills,
    });

    // Act - agentSlice の fetchSkills を呼び出す
    await store.fetchSkills();

    // Assert - 状態が agentSlice に保存される
    const newState = useStore.getState();
    expect(newState.availableSkillsMetadata).toEqual(mockAvailableSkills);
    expect(newState.importedSkills).toEqual(mockImportedSkills);

    // Assert - skillSlice からは参照されない（統合後は削除予定）
    // 注: この検証は Phase 5 実装後に有効化
  });

  it("INT-01-2: 複数コンポーネントから同じ状態を参照できる", () => {
    // Arrange
    const { result: hook1 } = renderHook(() =>
      useStore((s) => s.availableSkillsMetadata),
    );
    const { result: hook2 } = renderHook(() =>
      useStore((s) => s.availableSkillsMetadata),
    );

    // Assert - 同じ参照を共有
    expect(hook1.current).toBe(hook2.current);
  });
});
```

### 2.3 INT-02: アクション移行シナリオ

#### 目的

skillSlice のアクションが agentSlice で正しく動作することを検証する。

#### テストシナリオ

```typescript
describe("INT-02: アクション移行シナリオ", () => {
  describe("INT-02-1: スキルインポートフロー", () => {
    it("インポート → 状態更新 → UI 反映の完全フロー", async () => {
      // Arrange
      const store = useStore.getState();
      store.availableSkillsMetadata = mockAvailableSkills;
      setupMockElectronAPI({
        skillImport: mockImportedSkills[0],
      });

      // Act
      await store.importSkill("test-skill-1");

      // Assert
      const newState = useStore.getState();
      expect(newState.importedSkills).toHaveLength(1);
      expect(newState.isImporting).toBe(false);
    });
  });

  describe("INT-02-2: スキル実行フロー", () => {
    it("選択 → 実行 → ストリーミング → 完了の完全フロー", async () => {
      // Arrange
      const store = useStore.getState();
      store.importedSkills = mockImportedSkills;
      setupMockElectronAPI({
        skillExecute: { executionId: "exec-123", success: true },
      });

      // Act - スキル選択
      store.selectSkillByName("test-skill-1");
      expect(store.selectedSkillName).toBe("test-skill-1");

      // Act - 実行開始
      await store.executeSkill("テストプロンプト");
      expect(store.skillExecutionStatus).toBe("running");

      // Act - ストリームメッセージ受信（シミュレート）
      store._handleStreamMessage(mockStreamMessage);
      expect(store.streamingMessages).toHaveLength(1);

      // Act - 完了
      store._handleComplete("exec-123");
      expect(store.skillExecutionStatus).toBe("completed");
      expect(store.isExecuting).toBe(false);
    });
  });
});
```

### 2.4 INT-03: race condition シナリオ

#### 目的

executionId の事前生成により、IPC 応答前のストリームメッセージが正しく処理されることを検証する。

#### テストシナリオ

```typescript
describe("INT-03: race condition シナリオ", () => {
  it("INT-03-1: IPC 応答前のストリームメッセージが処理される", async () => {
    // Arrange
    const store = useStore.getState();
    store.importedSkills = mockImportedSkills;
    store.selectSkillByName("test-skill-1");

    let resolveExecute: (value: {
      executionId: string;
      success: boolean;
    }) => void;
    const executePromise = new Promise<{
      executionId: string;
      success: boolean;
    }>((resolve) => {
      resolveExecute = resolve;
    });

    setupMockElectronAPI({
      skillExecute: async () => {
        // 遅延応答をシミュレート
        return executePromise;
      },
    });

    // Act - 実行開始（まだ応答は返っていない）
    const execPromise = store.executeSkill("テストプロンプト");

    // Assert - 事前生成された executionId が設定されている
    const tempExecutionId = store.executionId;
    expect(tempExecutionId).not.toBeNull();
    expect(tempExecutionId).toMatch(/^[a-f0-9-]{36}$/);

    // Act - IPC 応答前にストリームメッセージが到着（シミュレート）
    const earlyMessage: SkillStreamMessage = {
      ...mockStreamMessage,
      executionId: tempExecutionId!,
    };
    store._handleStreamMessage(earlyMessage);

    // Assert - メッセージが正しく追加される
    expect(store.streamingMessages).toContainEqual(earlyMessage);

    // Act - IPC 応答が到着
    resolveExecute!({ executionId: "server-exec-123", success: true });
    await execPromise;

    // Assert - executionId がサーバー値で更新される
    expect(store.executionId).toBe("server-exec-123");
  });

  it("INT-03-2: 異なる executionId のメッセージは無視される", () => {
    // Arrange
    const store = useStore.getState();
    store.executionId = "exec-123";
    store.streamingMessages = [];

    // Act - 異なる executionId のメッセージ
    const wrongMessage: SkillStreamMessage = {
      ...mockStreamMessage,
      executionId: "exec-different",
    };

    // Note: この検証は useSkillExecution フック内で行われる
    // ストア自体は executionId によるフィルタリングを行わない
    // フックレベルでのフィルタリングテストは別途行う

    // Assert - ストアレベルではメッセージは追加される
    store._handleStreamMessage(wrongMessage);
    expect(store.streamingMessages).toHaveLength(1);
  });
});
```

### 2.5 INT-04: IPC リスナーシナリオ

#### 目的

IPC リスナーと Zustand ストアの連携が正しく機能することを検証する。

#### テストシナリオ

```typescript
describe("INT-04: IPC リスナーシナリオ", () => {
  it("INT-04-1: setupSkillListeners が agentSlice ハンドラを使用する", () => {
    // Arrange
    const store = useStore.getState();

    // このテストは setupSkillListeners 関数を対象とする
    // 統合後は skillSlice ではなく agentSlice のハンドラを使用することを検証

    // Assert - agentSlice のハンドラが存在する
    expect(typeof store._handleStreamMessage).toBe("function");
    expect(typeof store._handleComplete).toBe("function");
    expect(typeof store._handleError).toBe("function");
    expect(typeof store._handlePermissionRequest).toBe("function");
  });

  it("INT-04-2: 権限リクエスト → 応答フロー", async () => {
    // Arrange
    const store = useStore.getState();
    store.executionId = "exec-123";
    store.isExecuting = true;
    store.skillExecutionStatus = "running";
    setupMockElectronAPI();

    // Act - 権限リクエスト受信
    store._handlePermissionRequest(mockPermissionRequest);

    // Assert - 状態が更新される
    expect(store.pendingPermission).toEqual(mockPermissionRequest);
    expect(store.skillExecutionStatus).toBe("permission_pending");

    // Act - 権限承認
    store.respondToSkillPermission(true);

    // Assert - 権限がクリアされる
    expect(store.pendingPermission).toBeNull();
  });

  it("INT-04-3: エラーハンドリングフロー", () => {
    // Arrange
    const store = useStore.getState();
    store.executionId = "exec-123";
    store.isExecuting = true;
    store.skillExecutionStatus = "running";

    // Act
    store._handleError("exec-123", "実行エラー: タイムアウト");

    // Assert
    expect(store.isExecuting).toBe(false);
    expect(store.skillExecutionStatus).toBe("error");
    expect(store.skillError).toBe("実行エラー: タイムアウト");
  });
});
```

### 2.6 INT-05: 既存機能共存シナリオ

#### 目的

統合後も既存の agentSlice 機能（実行状態、プレビューなど）が正常に動作することを検証する。

#### テストシナリオ

```typescript
describe("INT-05: 既存機能共存シナリオ", () => {
  it("INT-05-1: 既存の executionState と新しい skillExecutionStatus は独立", () => {
    // Arrange
    const store = useStore.getState();

    // Act - 新しいスキル実行状態を変更
    store.skillExecutionStatus = "running";

    // Assert - 既存の executionState は影響を受けない
    expect(store.executionState.status).toBe("idle");

    // Act - 既存の実行状態を変更
    store.startExecution(mockSkill, "agent-exec-001");

    // Assert - 新しい skillExecutionStatus は影響を受けない
    expect(store.skillExecutionStatus).toBe("running");
    expect(store.executionState.status).toBe("executing");
  });

  it("INT-05-2: プレビュー機能は統合後も動作", () => {
    // Arrange
    const store = useStore.getState();

    // Act
    store.setPreviewContent({
      type: "html",
      content: "<h1>Test</h1>",
    });
    store.setSelectedEnvironment("web");
    store.setSplitRatio(60);

    // Assert
    expect(store.previewContent?.type).toBe("html");
    expect(store.selectedEnvironment).toBe("web");
    expect(store.splitRatio).toBe(60);
  });

  it("INT-05-3: 既存のスキル一覧と新しいスキルメタデータは独立", () => {
    // Arrange
    const store = useStore.getState();

    // Act - 新しいスキルメタデータを設定
    store.availableSkillsMetadata = mockAvailableSkills;
    store.importedSkills = mockImportedSkills;

    // Assert - 既存の skills 配列は影響を受けない
    expect(store.skills).toEqual([]);

    // Act - 既存のスキル一覧を設定
    store.setSkills([mockSkill]);

    // Assert - 新しいスキルメタデータは影響を受けない
    expect(store.availableSkillsMetadata).toEqual(mockAvailableSkills);
  });
});
```

---

## 3. テスト環境設定

### 3.1 必要なモック

```typescript
// ==========================================================================
// グローバルモック設定
// ==========================================================================

// Vitest セットアップ
beforeAll(() => {
  // window.electronAPI のモック
  Object.defineProperty(window, "electronAPI", {
    value: {
      skill: {
        list: vi.fn(),
        getImported: vi.fn(),
        import: vi.fn(),
        remove: vi.fn(),
        execute: vi.fn(),
        abort: vi.fn(),
        rescan: vi.fn(),
        sendPermissionResponse: vi.fn(),
        onStream: vi.fn(() => vi.fn()), // unsubscribe 関数を返す
        onComplete: vi.fn(() => vi.fn()),
        onError: vi.fn(() => vi.fn()),
        onPermissionRequest: vi.fn(() => vi.fn()),
      },
    },
    writable: true,
  });
});

afterEach(() => {
  // ストアをリセット
  useStore.getState().resetAgentState();
  vi.clearAllMocks();
});
```

### 3.2 テストユーティリティ

```typescript
// ==========================================================================
// テストユーティリティ
// ==========================================================================

/**
 * 非同期アクションの完了を待つ
 */
async function waitForStateUpdate(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * ストアの特定の状態変化を待つ
 */
async function waitForState<T>(
  selector: (state: AgentSlice) => T,
  predicate: (value: T) => boolean,
  timeout = 5000,
): Promise<T> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const value = selector(useStore.getState());
    if (predicate(value)) {
      return value;
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error("Timeout waiting for state update");
}
```

---

## 4. テストファイル構成

### 4.1 ファイル配置

```
apps/desktop/src/renderer/store/slices/__tests__/
├── agentSlice.skill-integration.test.ts      # 単体テスト（本タスク）
├── agentSlice.skill-integration.int.test.ts  # 統合テスト（本タスク）
├── agentSlice.test.ts                        # 既存
├── agentSlice.execution.test.ts              # 既存
├── agentSlice.permission.test.ts             # 既存
├── agentSlice.preview.test.ts                # 既存
├── skillSlice.test.ts                        # 既存（移行後削除予定）
└── ...
```

### 4.2 テスト命名規則

| ファイル種別 | パターン        | 例                                         |
| ------------ | --------------- | ------------------------------------------ |
| 単体テスト   | `*.test.ts`     | `agentSlice.skill-integration.test.ts`     |
| 統合テスト   | `*.int.test.ts` | `agentSlice.skill-integration.int.test.ts` |
| E2E テスト   | `*.e2e.test.ts` | `skill-execution.e2e.test.ts`              |

---

## 5. 実行コマンド

### 5.1 単体テスト

```bash
pnpm --filter @repo/desktop test:run apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts
```

### 5.2 統合テスト

```bash
pnpm --filter @repo/desktop test:run apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.int.test.ts
```

### 5.3 カバレッジ付き

```bash
pnpm --filter @repo/desktop test:coverage apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration*.test.ts
```

---

## 6. 検証チェックリスト

### 6.1 Phase 4 完了条件

- [ ] 単体テストファイル（56 ケース）が作成されている
- [ ] 統合テストシナリオが設計されている
- [ ] モックデータが定義されている
- [ ] テストヘルパー関数が設計されている
- [ ] テストが失敗状態（Red）である

### 6.2 Phase 5 で確認する項目

- [ ] 全 56 テストケースが PASS する
- [ ] 統合テストが PASS する
- [ ] カバレッジ目標を達成する（Line 80%+）
- [ ] 既存の agentSlice テストが引き続き PASS する

---

## 7. リスクと対策

### 7.1 リスク一覧

| リスク                        | 影響度 | 対策                               |
| ----------------------------- | ------ | ---------------------------------- |
| 既存テストとの競合            | HIGH   | 既存テストを先に実行して影響を確認 |
| モック不足による失敗          | MEDIUM | 必要なモックを事前に洗い出す       |
| 非同期処理のタイミング問題    | MEDIUM | waitForState ユーティリティを使用  |
| skillSlice 削除時の参照エラー | HIGH   | 段階的な移行（Phase 5 → Phase 8）  |

### 7.2 ロールバック計画

統合テストで重大な問題が発見された場合：

1. skillSlice を削除せず、両方のスライスを維持
2. 問題の根本原因を特定
3. Phase 2（設計）に戻って再設計を検討

---

## 8. 次のフェーズ

- **Phase 5**: 実装（TDD: Green）
  - テストが通るように agentSlice を拡張
  - skillSlice の状態・アクションを agentSlice に移行
  - setupSkillListeners を agentSlice ハンドラに接続
