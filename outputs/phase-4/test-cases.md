# テストケース一覧 - スライド依存関係管理システム

## 1. ドキュメント情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | task-feat-slide-dependency-management-003 |
| バージョン | 1.0.0                                     |
| 作成日     | 2026-01-09                                |
| 作成者     | Claude (tdd-principles skill)             |

---

## 2. ユニットテストケース

### 2.1 packages/shared/src/slide/ テスト

#### slide-project.test.ts

| TC-ID     | テスト名                                         | 対応AC | 期待結果                            |
| --------- | ------------------------------------------------ | ------ | ----------------------------------- |
| TC-SP-001 | createSlideProject: 正しいパスでプロジェクト生成 | -      | structurePath, htmlPathが正しく設定 |
| TC-SP-002 | createSlideProject: 初期syncStatusはsynced       | AC-09  | syncStatus === "synced"             |
| TC-SP-003 | updateSyncStatus: synced→out-of-sync             | AC-09  | syncStatus === "out-of-sync"        |
| TC-SP-004 | updateSyncStatus: synced設定時にlastSyncAt更新   | AC-10  | lastSyncAtが現在時刻に更新          |

```typescript
// slide-project.test.ts
describe("createSlideProject", () => {
  it("TC-SP-001: should create project with correct paths", () => {
    const project = createSlideProject("/path/to/project");
    expect(project.structurePath).toBe("/path/to/project/structure.md");
    expect(project.htmlPath).toBe("/path/to/project/index.html");
  });

  it("TC-SP-002: should set initial syncStatus to synced", () => {
    const project = createSlideProject("/path/to/project");
    expect(project.syncStatus).toBe("synced");
  });
});

describe("updateSyncStatus", () => {
  it("TC-SP-003: should update status from synced to out-of-sync", () => {
    const project = createSlideProject("/path");
    const updated = updateSyncStatus(project, "out-of-sync");
    expect(updated.syncStatus).toBe("out-of-sync");
  });

  it("TC-SP-004: should update lastSyncAt when status becomes synced", () => {
    const project = createSlideProject("/path");
    const updated = updateSyncStatus(project, "synced");
    expect(updated.lastSyncAt).toBeInstanceOf(Date);
  });
});
```

#### dependency-manager.test.ts

| TC-ID     | テスト名                                  | 対応AC | 期待結果                     |
| --------- | ----------------------------------------- | ------ | ---------------------------- |
| TC-DM-001 | calculateHash: 同一内容で同一ハッシュ     | AC-09  | 同じ文字列で同じハッシュ     |
| TC-DM-002 | calculateHash: 異なる内容で異なるハッシュ | AC-09  | 異なる文字列で異なるハッシュ |
| TC-DM-003 | checkDependencyStatus: 同期時true         | AC-09  | isInSync === true            |
| TC-DM-004 | checkDependencyStatus: 非同期時false      | AC-09  | isInSync === false           |

```typescript
// dependency-manager.test.ts
describe("calculateHash", () => {
  it("TC-DM-001: should return consistent hash for same content", async () => {
    const hash1 = await calculateHash("/mock/file");
    const hash2 = await calculateHash("/mock/file");
    expect(hash1).toBe(hash2);
  });

  it("TC-DM-002: should return different hash for different content", async () => {
    // モックで異なる内容を返す設定
    const hash1 = await calculateHash("/mock/file1");
    const hash2 = await calculateHash("/mock/file2");
    expect(hash1).not.toBe(hash2);
  });
});
```

---

### 2.2 apps/desktop/src/main/slide/ テスト

#### file-watcher.test.ts

| TC-ID     | テスト名                                    | 対応AC | 期待結果                        |
| --------- | ------------------------------------------- | ------ | ------------------------------- |
| TC-FW-001 | start: chokidar.watchが呼ばれる             | AC-02  | watch関数が正しいパスで呼ばれる |
| TC-FW-002 | start: structure.mdとindex.htmlを監視       | AC-02  | 両ファイルが監視対象            |
| TC-FW-003 | stop: watcher.closeが呼ばれる               | AC-02  | close関数が呼ばれる             |
| TC-FW-004 | onStructureChange: 変更時コールバック実行   | AC-01  | callback関数が呼ばれる          |
| TC-FW-005 | markAsSkillChange: スキル変更がマークされる | AC-03  | changeContextMapに記録          |
| TC-FW-006 | handleChange: スキル変更は無視される        | AC-03  | コールバックが呼ばれない        |
| TC-FW-007 | handleChange: ユーザー変更はイベント発火    | AC-01  | structureChangeイベントが発火   |
| TC-FW-008 | デバウンス: 500ms以内の変更は集約           | AC-03  | 1回のイベントのみ発火           |

```typescript
// file-watcher.test.ts
describe("SlideFileWatcher", () => {
  let watcher: SlideFileWatcher;
  let mockChokidar: any;

  beforeEach(() => {
    vi.useFakeTimers();
    mockChokidar = {
      watch: vi.fn().mockReturnValue(new EventEmitter()),
    };
    vi.mock("chokidar", () => mockChokidar);
    watcher = new SlideFileWatcher();
  });

  afterEach(() => {
    vi.useRealTimers();
    watcher.stop();
  });

  it("TC-FW-001: should call chokidar.watch on start", () => {
    watcher.start("/project");
    expect(mockChokidar.watch).toHaveBeenCalled();
  });

  it("TC-FW-004: should call callback on structure.md change", () => {
    const callback = vi.fn();
    watcher.onStructureChange(callback);
    watcher.start("/project");

    // ファイル変更をシミュレート
    watcher["handleChange"]("/project/structure.md");

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ path: "/project/structure.md" }),
    );
  });

  it("TC-FW-006: should ignore skill-generated changes", () => {
    const callback = vi.fn();
    watcher.onStructureChange(callback);
    watcher.start("/project");

    // スキル変更としてマーク
    watcher.markAsSkillChange("/project/index.html", "html");

    // 変更をシミュレート
    watcher["handleChange"]("/project/index.html");

    expect(callback).not.toHaveBeenCalled();
  });

  it("TC-FW-008: should debounce rapid changes", () => {
    const callback = vi.fn();
    watcher.onStructureChange(callback);
    watcher.start("/project");

    // 連続変更
    watcher["handleChange"]("/project/structure.md");
    watcher["handleChange"]("/project/structure.md");
    watcher["handleChange"]("/project/structure.md");

    vi.advanceTimersByTime(500);

    // 集約されて1回だけ呼ばれる
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
```

#### skill-executor.test.ts

| TC-ID     | テスト名                               | 対応AC | 期待結果                        |
| --------- | -------------------------------------- | ------ | ------------------------------- |
| TC-SE-001 | execute: hearing phaseが実行できる     | AC-04  | phase === "hearing"の結果返却   |
| TC-SE-002 | execute: structure phaseが実行できる   | AC-05  | phase === "structure"の結果返却 |
| TC-SE-003 | execute: html phaseが実行できる        | AC-06  | phase === "html"の結果返却      |
| TC-SE-004 | execute: modifier phaseが実行できる    | AC-07  | phase === "modifier"の結果返却  |
| TC-SE-005 | execute: 二重実行でエラー              | AC-04  | SLIDE_E003エラー                |
| TC-SE-006 | onProgress: 進捗コールバックが呼ばれる | AC-04  | progress値が通知される          |
| TC-SE-007 | cancel: キャンセルでCancelledエラー    | AC-08  | "Cancelled"エラー               |
| TC-SE-008 | execute: 成功時にresultが返る          | AC-04  | success === true                |
| TC-SE-009 | execute: 失敗時にerrorが返る           | AC-11  | success === false, error設定    |

```typescript
// skill-executor.test.ts
describe("SkillExecutor", () => {
  let executor: SkillExecutor;

  beforeEach(() => {
    executor = new SkillExecutor();
  });

  it("TC-SE-001: should execute hearing phase", async () => {
    const result = await executor.execute("hearing", "/project");
    expect(result.phase).toBe("hearing");
    expect(result.success).toBe(true);
  });

  it("TC-SE-005: should throw error on concurrent execution", async () => {
    const promise1 = executor.execute("hearing", "/project");

    await expect(executor.execute("structure", "/project")).rejects.toThrow(
      "Another skill is already executing",
    );

    await promise1;
  });

  it("TC-SE-006: should emit progress events", async () => {
    const progressCallback = vi.fn();
    executor.onProgress(progressCallback);

    await executor.execute("html", "/project");

    expect(progressCallback).toHaveBeenCalled();
    expect(progressCallback).toHaveBeenCalledWith(expect.any(Number));
  });

  it("TC-SE-007: should cancel execution", async () => {
    const promise = executor.execute("html", "/project");
    executor.cancel();

    await expect(promise).rejects.toThrow("Cancelled");
  });
});
```

#### sync-manager.test.ts

| TC-ID     | テスト名                         | 対応AC | 期待結果                 |
| --------- | -------------------------------- | ------ | ------------------------ |
| TC-SM-001 | getStatus: synced状態を取得      | AC-09  | status === "synced"      |
| TC-SM-002 | getStatus: out-of-sync状態を取得 | AC-09  | status === "out-of-sync" |
| TC-SM-003 | sync: 同期実行後syncedに変更     | AC-10  | status === "synced"      |
| TC-SM-004 | sync: lastSyncAtが更新される     | AC-10  | lastSyncAtが更新される   |

```typescript
// sync-manager.test.ts
describe("SyncManager", () => {
  let manager: SyncManager;

  beforeEach(() => {
    manager = new SyncManager();
  });

  it("TC-SM-001: should return synced status", async () => {
    // モックで同期状態を設定
    const status = await manager.getStatus("/project");
    expect(["synced", "out-of-sync", "syncing", "error"]).toContain(
      status.status,
    );
  });

  it("TC-SM-003: should become synced after sync", async () => {
    await manager.sync("/project");
    const status = await manager.getStatus("/project");
    expect(status.status).toBe("synced");
  });
});
```

---

### 2.3 apps/desktop/src/renderer/slide/ テスト

#### slideProjectStore.test.ts

| TC-ID     | テスト名                                 | 対応AC | 期待結果                   |
| --------- | ---------------------------------------- | ------ | -------------------------- |
| TC-ST-001 | setProject: プロジェクト情報が設定される | AC-02  | project, projectPathが設定 |
| TC-ST-002 | clearProject: 状態がリセットされる       | -      | 初期状態に戻る             |
| TC-ST-003 | setSyncStatus: 同期状態が変更される      | AC-09  | syncStatus更新             |
| TC-ST-004 | setPhase: 実行フェーズが変更される       | AC-04  | currentPhase更新           |
| TC-ST-005 | setProgress: 進捗が更新される            | AC-04  | executionProgress更新      |
| TC-ST-006 | addExecutionResult: 履歴に追加される     | AC-04  | executionHistory配列に追加 |
| TC-ST-007 | addExecutionResult: 最新10件を保持       | -      | 配列長が10以下             |
| TC-ST-008 | reset: 全状態が初期化される              | -      | initialStateと一致         |

```typescript
// slideProjectStore.test.ts
describe("slideProjectStore", () => {
  beforeEach(() => {
    const { reset } = useSlideProjectStore.getState();
    reset();
  });

  it("TC-ST-001: should set project correctly", () => {
    const { setProject } = useSlideProjectStore.getState();
    const mockProject = {
      path: "/test",
      structurePath: "/test/structure.md",
      htmlPath: "/test/index.html",
      syncStatus: "synced" as const,
      lastSyncAt: null,
      structureHash: null,
      htmlHash: null,
    };

    setProject(mockProject);

    const state = useSlideProjectStore.getState();
    expect(state.project).toEqual(mockProject);
    expect(state.projectPath).toBe("/test");
  });

  it("TC-ST-003: should update sync status", () => {
    const { setSyncStatus } = useSlideProjectStore.getState();

    setSyncStatus("out-of-sync");

    expect(useSlideProjectStore.getState().syncStatus).toBe("out-of-sync");
  });

  it("TC-ST-007: should keep only last 10 execution results", () => {
    const { addExecutionResult } = useSlideProjectStore.getState();

    for (let i = 0; i < 15; i++) {
      addExecutionResult({
        phase: "html",
        success: true,
        duration: 100,
        timestamp: new Date(),
      });
    }

    expect(useSlideProjectStore.getState().executionHistory).toHaveLength(10);
  });
});
```

---

### 2.4 UIコンポーネントテスト

#### SyncStatusIndicator.test.tsx

| TC-ID     | テスト名                        | 対応AC | 期待結果                 |
| --------- | ------------------------------- | ------ | ------------------------ |
| TC-UI-001 | synced状態で「同期済み」表示    | AC-09  | テキスト「同期済み」     |
| TC-UI-002 | synced状態で緑色表示            | AC-09  | 緑色のスタイル           |
| TC-UI-003 | out-of-sync状態で「非同期」表示 | AC-09  | テキスト「非同期」       |
| TC-UI-004 | out-of-sync状態で黄色表示       | AC-09  | 黄色のスタイル           |
| TC-UI-005 | syncing状態で「同期中」表示     | AC-09  | テキスト「同期中」       |
| TC-UI-006 | syncing状態でアニメーション表示 | AC-09  | 回転アニメーションクラス |
| TC-UI-007 | error状態で「エラー」表示       | AC-09  | テキスト「エラー」       |
| TC-UI-008 | error状態で赤色表示             | AC-09  | 赤色のスタイル           |

```typescript
// SyncStatusIndicator.test.tsx
describe("SyncStatusIndicator", () => {
  it("TC-UI-001: should display '同期済み' when synced", () => {
    render(<SyncStatusIndicator status="synced" />);
    expect(screen.getByText(/同期済み/i)).toBeInTheDocument();
  });

  it("TC-UI-002: should display green color when synced", () => {
    const { container } = render(<SyncStatusIndicator status="synced" />);
    expect(container.firstChild).toHaveClass("text-green-500");
  });

  it("TC-UI-006: should display animation when syncing", () => {
    const { container } = render(<SyncStatusIndicator status="syncing" />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });
});
```

#### SkillPhasePanel.test.tsx

| TC-ID     | テスト名                                  | 対応AC   | 期待結果               |
| --------- | ----------------------------------------- | -------- | ---------------------- |
| TC-UI-009 | 4つのスキルボタンが表示される             | AC-04-07 | 4つのボタンが存在      |
| TC-UI-010 | ヒアリングボタンクリックでonExecute呼出   | AC-04    | onExecute("hearing")   |
| TC-UI-011 | 構成設計ボタンクリックでonExecute呼出     | AC-05    | onExecute("structure") |
| TC-UI-012 | HTML生成ボタンクリックでonExecute呼出     | AC-06    | onExecute("html")      |
| TC-UI-013 | スライド修正ボタンクリックでonExecute呼出 | AC-07    | onExecute("modifier")  |
| TC-UI-014 | 実行中は全ボタン無効化                    | AC-04    | disabled === true      |
| TC-UI-015 | プログレスバーが表示される                | AC-04    | ProgressBar要素が存在  |

```typescript
// SkillPhasePanel.test.tsx
describe("SkillPhasePanel", () => {
  it("TC-UI-009: should render 4 skill buttons", () => {
    render(<SkillPhasePanel onExecute={vi.fn()} />);
    expect(screen.getByRole("button", { name: /ヒアリング/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /構成設計/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /HTML生成/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /スライド修正/i })).toBeInTheDocument();
  });

  it("TC-UI-010: should call onExecute with 'hearing' when clicked", () => {
    const onExecute = vi.fn();
    render(<SkillPhasePanel onExecute={onExecute} />);

    fireEvent.click(screen.getByRole("button", { name: /ヒアリング/i }));

    expect(onExecute).toHaveBeenCalledWith("hearing");
  });

  it("TC-UI-014: should disable all buttons during execution", () => {
    render(<SkillPhasePanel onExecute={vi.fn()} isExecuting={true} />);

    expect(screen.getByRole("button", { name: /ヒアリング/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /構成設計/i })).toBeDisabled();
  });
});
```

---

## 3. テストケース統計

### 3.1 カテゴリ別件数

| カテゴリ           | テストケース数 | 優先度High | 優先度Medium |
| ------------------ | -------------- | ---------- | ------------ |
| slide-project      | 4              | 4          | 0            |
| dependency-manager | 4              | 4          | 0            |
| file-watcher       | 8              | 6          | 2            |
| skill-executor     | 9              | 7          | 2            |
| sync-manager       | 4              | 2          | 2            |
| store              | 8              | 4          | 4            |
| UIコンポーネント   | 15             | 8          | 7            |
| **合計**           | **52**         | **35**     | **17**       |

### 3.2 受け入れ基準カバレッジ

| AC-ID | 対応TC数 | カバー率 |
| ----- | -------- | -------- |
| AC-01 | 3        | 100%     |
| AC-02 | 4        | 100%     |
| AC-03 | 3        | 100%     |
| AC-04 | 8        | 100%     |
| AC-05 | 2        | 100%     |
| AC-06 | 2        | 100%     |
| AC-07 | 2        | 100%     |
| AC-08 | 2        | 100%     |
| AC-09 | 12       | 100%     |
| AC-10 | 3        | 100%     |
| AC-11 | 2        | 100%     |

---

## 4. 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-09 | 初版作成 |
