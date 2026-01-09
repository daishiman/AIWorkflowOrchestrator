# Phase 4: テスト作成 - スライド依存関係管理システム

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 4                                         |
| タスクID   | task-feat-slide-dependency-management-003 |
| 名称       | テスト作成                                |
| ステータス | 未実施                                    |
| 依存Phase  | Phase 1, 2, 3                             |

---

## 目的

TDD: 期待される動作を検証するテストを実装より先に作成する（Red状態）。

---

## 使用スキル

| スキル名              | パス                                            | 選定理由                                      |
| --------------------- | ----------------------------------------------- | --------------------------------------------- |
| tdd-principles        | `.claude/skills/tdd-principles/SKILL.md`        | TDD原則（Trigger: TDD, テスト駆動）           |
| test-doubles          | `.claude/skills/test-doubles/SKILL.md`          | モック・スタブ設計（Trigger: モック, スタブ） |
| frontend-testing      | `.claude/skills/frontend-testing/SKILL.md`      | フロントエンドテスト（Trigger: Reactテスト）  |
| flaky-test-prevention | `.claude/skills/flaky-test-prevention/SKILL.md` | 不安定テスト防止（Trigger: 非同期テスト）     |

**実行方法**: 各スキルのSKILL.mdを読み込み、スキルを参照して実行

---

## 統合テスト連携【必須】

### Phase 4での統合テスト連携アクション

統合テストシナリオを全カテゴリで作成する。

**作成対象カテゴリ**:

| カテゴリ           | 検証内容                           |
| ------------------ | ---------------------------------- |
| API接続テスト      | IPC通信の疎通・レスポンス形式      |
| データフローテスト | Main→Renderer→Store→UIの往復       |
| エラーハンドリング | スキル実行失敗時のUI表示・リトライ |
| 認証連携テスト     | （該当なし - 認証不要）            |
| 状態同期テスト     | ファイル変更→状態更新→UI反映       |

---

## 実行手順

### Step 1: ユニットテスト作成

#### packages/shared/src/slide/ のテスト

```typescript
// slide-project.test.ts
import { describe, it, expect } from "vitest";
import { createSlideProject, getSyncStatus } from "./slide-project";

describe("createSlideProject", () => {
  it("should create a slide project with correct paths", () => {
    const project = createSlideProject("/path/to/project");
    expect(project.path).toBe("/path/to/project");
    expect(project.structurePath).toBe("/path/to/project/structure.md");
    expect(project.htmlPath).toBe("/path/to/project/index.html");
    expect(project.syncStatus).toBe("synced");
  });
});

describe("getSyncStatus", () => {
  it('should return "synced" when files are in sync', async () => {
    // テスト実装
  });

  it('should return "out-of-sync" when files differ', async () => {
    // テスト実装
  });
});

// dependency-manager.test.ts
import { describe, it, expect } from "vitest";
import { checkDependency, calculateHash } from "./dependency-manager";

describe("checkDependency", () => {
  it("should return true when structure.md and index.html are in sync", async () => {
    // テスト実装
  });

  it("should return false when structure.md is newer than index.html", async () => {
    // テスト実装
  });
});

describe("calculateHash", () => {
  it("should calculate consistent hash for same content", async () => {
    // テスト実装
  });
});
```

#### apps/desktop/src/main/slide/ のテスト

```typescript
// file-watcher.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createSlideWatcher } from "./file-watcher";

describe("SlideWatcher", () => {
  let watcher: ReturnType<typeof createSlideWatcher>;

  beforeEach(() => {
    watcher = createSlideWatcher("/test/project");
  });

  afterEach(() => {
    watcher.stop();
  });

  it("should start watching structure.md", () => {
    watcher.start();
    expect(watcher.watcher).not.toBeNull();
  });

  it("should call callback on structure.md change", async () => {
    const callback = vi.fn();
    watcher.onStructureChange(callback);
    watcher.start();

    // ファイル変更をシミュレート
    // callback が呼ばれることを確認
  });

  it("should stop watching when stop() is called", () => {
    watcher.start();
    watcher.stop();
    expect(watcher.watcher).toBeNull();
  });
});

// skill-executor.test.ts
import { describe, it, expect, vi } from "vitest";
import { createSkillExecutor } from "./skill-executor";

describe("SkillExecutor", () => {
  it("should execute hearing-facilitator skill", async () => {
    const executor = createSkillExecutor();
    const result = await executor.execute("hearing", "/test/project");
    expect(result.phase).toBe("hearing");
    // 実装前なのでテストは失敗する（Red状態）
  });

  it("should emit progress events during execution", async () => {
    const executor = createSkillExecutor();
    const progressCallback = vi.fn();
    executor.onProgress(progressCallback);

    await executor.execute("html", "/test/project");

    expect(progressCallback).toHaveBeenCalled();
  });

  it("should be cancellable", async () => {
    const executor = createSkillExecutor();
    const promise = executor.execute("html", "/test/project");
    executor.cancel();

    await expect(promise).rejects.toThrow("Cancelled");
  });
});

// sync-manager.test.ts
import { describe, it, expect } from "vitest";
import { createSyncManager } from "./sync-manager";

describe("SyncManager", () => {
  it("should return sync status for a project", async () => {
    const manager = createSyncManager();
    const status = await manager.getStatus("/test/project");
    expect(["synced", "out-of-sync", "syncing", "error"]).toContain(status);
  });

  it("should sync project when requested", async () => {
    const manager = createSyncManager();
    await manager.sync("/test/project");
    const status = await manager.getStatus("/test/project");
    expect(status).toBe("synced");
  });
});
```

### Step 2: 統合テスト作成

```typescript
// slide-integration.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Slide Dependency Management Integration", () => {
  describe("IPC通信テスト", () => {
    it("should handle slide:executePhase IPC call", async () => {
      // IPC通信のモックを使用したテスト
    });

    it("should handle slide:startWatching IPC call", async () => {
      // テスト実装
    });

    it("should emit slide:structureChanged event on file change", async () => {
      // テスト実装
    });
  });

  describe("データフローテスト", () => {
    it("should flow: structure.md change → watcher → IPC → store → UI", async () => {
      // End-to-endのデータフローテスト
    });
  });

  describe("エラーハンドリングテスト", () => {
    it("should handle skill execution failure gracefully", async () => {
      // スキル実行失敗時のテスト
    });

    it("should retry on transient errors", async () => {
      // リトライロジックのテスト
    });
  });

  describe("状態同期テスト", () => {
    it("should update sync status when file changes", async () => {
      // 状態同期のテスト
    });

    it("should prevent infinite loop on skill-generated changes", async () => {
      // 無限ループ防止のテスト
    });
  });
});
```

### Step 3: UIコンポーネントテスト作成

```typescript
// SlideWorkspace.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SlideWorkspace } from './SlideWorkspace';

describe('SlideWorkspace', () => {
  it('should render skill phase buttons', () => {
    render(<SlideWorkspace />);
    expect(screen.getByRole('button', { name: /ヒアリング/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /構成設計/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /HTML生成/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /スライド修正/i })).toBeInTheDocument();
  });
});

// SyncStatusIndicator.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SyncStatusIndicator } from './SyncStatusIndicator';

describe('SyncStatusIndicator', () => {
  it('should display "同期済み" when synced', () => {
    render(<SyncStatusIndicator status="synced" />);
    expect(screen.getByText(/同期済み/i)).toBeInTheDocument();
  });

  it('should display "非同期" when out-of-sync', () => {
    render(<SyncStatusIndicator status="out-of-sync" />);
    expect(screen.getByText(/非同期/i)).toBeInTheDocument();
  });

  it('should display "同期中" when syncing', () => {
    render(<SyncStatusIndicator status="syncing" />);
    expect(screen.getByText(/同期中/i)).toBeInTheDocument();
  });
});

// SkillPhasePanel.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkillPhasePanel } from './SkillPhasePanel';

describe('SkillPhasePanel', () => {
  it('should call onExecute when phase button is clicked', () => {
    const onExecute = vi.fn();
    render(<SkillPhasePanel onExecute={onExecute} />);

    fireEvent.click(screen.getByRole('button', { name: /ヒアリング/i }));
    expect(onExecute).toHaveBeenCalledWith('hearing');
  });

  it('should disable buttons during execution', () => {
    render(<SkillPhasePanel isExecuting={true} />);
    expect(screen.getByRole('button', { name: /ヒアリング/i })).toBeDisabled();
  });
});
```

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 使用スキルの実行（各スキルごとに1タスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## 成果物

| 成果物               | パス                                            | 説明                 | 必須 |
| -------------------- | ----------------------------------------------- | -------------------- | ---- |
| テスト仕様書         | `outputs/phase-4/test-specification.md`         | テスト方針と観点     | ✅   |
| テストケース一覧     | `outputs/phase-4/test-cases.md`                 | テストケースの一覧   | ✅   |
| 統合テストシナリオ   | `outputs/phase-4/integration-test.md`           | 統合テストのシナリオ | ✅   |
| ユニットテストコード | `packages/*/src/**/*.test.ts`（プロジェクト内） | テストコード         | ✅   |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> テスト設計時に必ず以下のシステム仕様を確認し、テスト観点に反映してください。

| 参照資料             | パス                                                                     | 内容                    |
| -------------------- | ------------------------------------------------------------------------ | ----------------------- |
| Electron IPC設計     | `.claude/skills/aiworkflow-requirements/references/electron-ipc-spec.md` | IPC通信仕様             |
| Agent SDK統合        | `.claude/skills/aiworkflow-requirements/references/agent-sdk-spec.md`    | Agent SDK統合仕様       |
| 状態管理ガイドライン | `.claude/skills/aiworkflow-requirements/references/state-management.md`  | Zustand使用ガイドライン |

### Phase 1成果物

| 参照資料     | パス                                     | 説明         |
| ------------ | ---------------------------------------- | ------------ |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md` | テスト観点元 |

### Phase 2成果物

| 参照資料     | パス                                   | 説明              |
| ------------ | -------------------------------------- | ----------------- |
| API仕様      | `outputs/phase-2/api-specification.md` | IPC通信テスト観点 |
| 状態管理設計 | `outputs/phase-2/state-design.md`      | 状態テスト観点    |

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/slide-dependency-management --phase 4

# Phase完了・成果物登録
node .claude/skills/task-specification-creator/scripts/complete-phase.mjs \
  --workflow docs/30-workflows/slide-dependency-management --phase 4 --artifacts "test-specification.md,test-cases.md,integration-test.md"
```

---

## 完了条件チェックリスト

- [ ] 受け入れ基準ごとにユニットテストがある
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] モック・スタブが適切に設計されている
- [ ] 非同期テストの待機処理が適切に設計されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## テストカバレッジ目標

### ユニットテスト

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### 統合テスト

| カテゴリ           | 目標 |
| ------------------ | ---- |
| IPC通信            | 100% |
| データフロー       | 100% |
| エラーハンドリング | 80%+ |
| 状態同期           | 100% |

---

## スキルフィードバック記録

| スキル                | 結果    | 備考 |
| --------------------- | ------- | ---- |
| tdd-principles        | pending | -    |
| test-doubles          | pending | -    |
| frontend-testing      | pending | -    |
| flaky-test-prevention | pending | -    |

---

## 前後Phase

- 前: [Phase 3: 設計レビューゲート](phase-3-design-review.md)
- 次: [Phase 5: 実装](phase-5-implementation.md)
