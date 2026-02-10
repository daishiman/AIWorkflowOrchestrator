# Phase 4: テスト仕様書

## メタ情報

| 項目           | 値                                     |
| -------------- | -------------------------------------- |
| タスクID       | TASK-FIX-6-1-STATE-CENTRALIZATION      |
| Phase          | 4                                      |
| 作成日         | 2026-02-09                             |
| テストファイル | `agentSlice.skill-integration.test.ts` |

## 1. テスト概要

### 1.1 目的

skillSlice から agentSlice への状態統合に関するテストを TDD Red フェーズとして設計する。

### 1.2 テスト観点

| 観点                   | 説明                                                      |
| ---------------------- | --------------------------------------------------------- |
| 状態統合の正確性       | skillSlice の状態が agentSlice に正しく統合されること     |
| 既存機能の維持         | agentSlice の既存機能が影響を受けないこと                 |
| アクション移行の完全性 | skillSlice のアクションが agentSlice で正しく動作すること |
| race condition 対策    | executionId 事前生成による競合回避が機能すること          |
| IPC ハンドラの統合     | ストリーミングメッセージ処理が正しく動作すること          |

### 1.3 テスト範囲

```
対象レイヤー:
├── Renderer Process
│   └── Zustand Store
│       ├── agentSlice（統合先）
│       └── skillSlice（統合元 - 移行後削除対象）
└── IPC 通信
    └── スキル関連リスナーハンドラ
```

## 2. テストカテゴリ

### 2.1 カテゴリ構成

| カテゴリID | カテゴリ名               | テスト数 | テストケースID         |
| ---------- | ------------------------ | -------- | ---------------------- |
| CAT-01     | 初期状態テスト           | 10       | TS-6-1-01 〜 TS-6-1-10 |
| CAT-02     | 既存機能維持テスト       | 3        | TS-6-1-11 〜 TS-6-1-13 |
| CAT-03     | スキル取得テスト         | 5        | TS-6-1-14 〜 TS-6-1-18 |
| CAT-04     | スキルインポートテスト   | 3        | TS-6-1-19 〜 TS-6-1-21 |
| CAT-05     | スキル削除テスト         | 3        | TS-6-1-22 〜 TS-6-1-24 |
| CAT-06     | スキル選択テスト         | 3        | TS-6-1-25 〜 TS-6-1-27 |
| CAT-07     | スキル実行テスト         | 8        | TS-6-1-28 〜 TS-6-1-35 |
| CAT-08     | 実行中断テスト           | 4        | TS-6-1-36 〜 TS-6-1-39 |
| CAT-09     | ストリームハンドラテスト | 9        | TS-6-1-40 〜 TS-6-1-48 |
| CAT-10     | 権限管理テスト           | 8        | TS-6-1-49 〜 TS-6-1-56 |

**合計: 56 テストケース**

### 2.2 カバレッジ目標

| 指標              | 最低基準 | 目標値 |
| ----------------- | -------- | ------ |
| Line Coverage     | 80%      | 90%    |
| Branch Coverage   | 60%      | 70%    |
| Function Coverage | 80%      | 90%    |

## 3. モックデータ定義

### 3.1 スキルメタデータモック

```typescript
const mockAvailableSkills: SkillMetadata[] = [
  {
    name: "test-skill-1",
    description: "テストスキル1の説明",
    path: "~/.claude/skills/test-skill-1",
    updatedAt: new Date("2026-01-01"),
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
  },
  {
    name: "test-skill-2",
    description: "テストスキル2の説明",
    path: "~/.claude/skills/test-skill-2",
    updatedAt: new Date("2026-01-02"),
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
  },
];
```

### 3.2 インポート済みスキルモック

```typescript
const mockImportedSkills: ImportedSkill[] = [
  {
    ...mockAvailableSkills[0],
    importedAt: new Date("2026-01-10"),
    status: "active",
  },
];
```

### 3.3 ストリームメッセージモック

```typescript
const mockStreamMessage: SkillStreamMessage = {
  executionId: "exec-123",
  type: "assistant",
  content: { text: "テストメッセージ", isPartial: false },
  timestamp: Date.now(),
};
```

### 3.4 権限リクエストモック

```typescript
const mockPermissionRequest: SkillPermissionRequest = {
  executionId: "exec-123",
  requestId: "req-456",
  toolName: "Bash",
  args: { command: "ls -la" },
};
```

### 3.5 実行レスポンスモック

```typescript
const mockExecutionResponse: SkillExecutionResponse = {
  executionId: "exec-123",
  success: true,
};
```

## 4. テストヘルパー関数

### 4.1 テスト用ストア作成

```typescript
/**
 * テスト用ストア作成
 * @description 独立したストアインスタンスを作成し、テスト間の状態干渉を防ぐ
 */
function createTestStore(): AgentSlice {
  let internalState: Partial<AgentSlice> = {};

  const set = (
    fn: ((state: AgentSlice) => Partial<AgentSlice>) | Partial<AgentSlice>,
  ) => {
    const partial =
      typeof fn === "function" ? fn(internalState as AgentSlice) : fn;
    internalState = { ...internalState, ...partial };
    Object.assign(store, internalState);
  };

  const get = () => internalState as AgentSlice;

  const store = createAgentSlice(set as never, get as never, {} as never);
  return store;
}
```

### 4.2 ElectronAPI モックセットアップ

```typescript
/**
 * ElectronAPI モックセットアップ
 * @description IPC 通信をモック化し、テスト内で任意の応答を返す
 */
interface MockElectronAPIOptions {
  skillList?: SkillMetadata[];
  skillListError?: Error;
  skillGetImported?: ImportedSkill[];
  skillImport?: ImportedSkill;
  skillImportError?: Error;
  skillExecute?:
    | { executionId: string; success: boolean }
    | ((params: {
        skillName: string;
        prompt: string;
        tempExecutionId?: string;
      }) => Promise<{ executionId: string; success: boolean }>);
  skillExecuteError?: Error;
  skillAbort?: () => void;
  skillSendPermissionResponse?: (params: {
    requestId: string;
    approved: boolean;
    rememberChoice?: boolean;
  }) => void;
}

function setupMockElectronAPI(options: MockElectronAPIOptions = {}): void {
  const mockSkillAPI = {
    list: options.skillListError
      ? vi.fn().mockRejectedValue(options.skillListError)
      : vi.fn().mockResolvedValue(options.skillList ?? []),
    getImported: vi.fn().mockResolvedValue(options.skillGetImported ?? []),
    import: options.skillImportError
      ? vi.fn().mockRejectedValue(options.skillImportError)
      : vi.fn().mockResolvedValue(options.skillImport ?? mockImportedSkills[0]),
    remove: vi.fn().mockResolvedValue(undefined),
    execute: options.skillExecuteError
      ? vi.fn().mockRejectedValue(options.skillExecuteError)
      : typeof options.skillExecute === "function"
        ? vi.fn().mockImplementation(options.skillExecute)
        : vi.fn().mockResolvedValue(
            options.skillExecute ?? {
              executionId: "exec-123",
              success: true,
            },
          ),
    abort: options.skillAbort ?? vi.fn(),
    rescan: vi.fn().mockResolvedValue(options.skillList ?? []),
    sendPermissionResponse: options.skillSendPermissionResponse ?? vi.fn(),
  };

  Object.defineProperty(window, "electronAPI", {
    value: { skill: mockSkillAPI },
    writable: true,
  });
}
```

## 5. テスト実行

### 5.1 コマンド

```bash
# 単体テスト実行
pnpm --filter @repo/desktop test:run apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts

# ウォッチモード
pnpm --filter @repo/desktop test apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts

# カバレッジ付き
pnpm --filter @repo/desktop test:coverage apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts
```

### 5.2 TDD Red フェーズ確認

```bash
# 全テストが失敗することを確認
# 失敗理由: メソッド/プロパティが存在しない
```

## 6. テストファイル構造

```
apps/desktop/src/renderer/store/slices/__tests__/
├── agentSlice.skill-integration.test.ts  # 本タスクで作成
├── agentSlice.test.ts                    # 既存
├── agentSlice.execution.test.ts          # 既存
├── agentSlice.permission.test.ts         # 既存
├── agentSlice.preview.test.ts            # 既存
├── skillSlice.test.ts                    # 既存（移行後削除予定）
└── ...
```

## 7. 依存関係

### 7.1 テスト対象ファイル

| ファイル               | 役割         |
| ---------------------- | ------------ |
| `agentSlice.ts`        | 統合先 Slice |
| `skillSlice.ts`        | 統合元 Slice |
| `useSkillExecution.ts` | 実行フック   |

### 7.2 共有型定義

| 型名                     | パス                       |
| ------------------------ | -------------------------- |
| `SkillMetadata`          | `@repo/shared/types/skill` |
| `ImportedSkill`          | `@repo/shared/types/skill` |
| `SkillStreamMessage`     | `@repo/shared/types/skill` |
| `SkillPermissionRequest` | `@repo/shared/types/skill` |
| `SkillExecutionStatus`   | `@repo/shared/types/skill` |
| `SkillExecutionResponse` | `@repo/shared/types/skill` |

## 8. 次のフェーズ

- **Phase 5**: 実装（TDD: Green）
  - テストが通るように agentSlice を拡張
  - skillSlice の状態・アクションを agentSlice に移行
