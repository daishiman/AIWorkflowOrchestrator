# Phase 1: 要件定義書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| タスクID   | UT-STORE-HOOKS-TEST-REFACTOR-001 |
| Phase      | 1                                |
| 作成日     | 2026-02-12                       |
| ステータス | 完了                             |

---

## 1. 移行対象の特定

### 1.1 ファイル名マッピング

Issue #779記載のファイル名と実際のファイル名を照合し、以下のマッピングを確定した。

| Issue記載名                    | 実際のファイル名                                                        | 現在のパターン | 移行必要 |
| ------------------------------ | ----------------------------------------------------------------------- | -------------- | -------- |
| infiniteLoopPrevention.test.ts | 独立ファイルなし（各Sliceテスト内の「無限ループ防止」セクションで検証） | -              | 確認要   |
| authModeSelectors.test.ts      | `slices/__tests__/authModeSlice.selectors.test.ts`                      | renderHook     | 不要     |
| llmSelectors.test.ts           | `slices/__tests__/llmSlice.selectors.test.ts`                           | renderHook     | 不要     |
| skillSelectors.test.ts         | `slices/__tests__/agentSlice.selectors.test.ts`                         | getState()     | **必要** |

### 1.2 agentSlice テスト統計

| 項目                  | 値                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------ |
| 既存テスト数          | 48件                                                                                       |
| CAT別内訳             | CAT-01:13, CAT-02:7, CAT-03:10, CAT-04:3, CAT-05:4, CAT-06:2, CAT-07:3, CAT-08:4, CAT-09:2 |
| getState()呼び出し数  | 約172箇所                                                                                  |
| 個別セレクタHook数    | 23個（状態13 + アクション10）                                                              |
| 使用ストア            | 独立ストア（`create<AgentSlice>()`）                                                       |
| electronAPIモック範囲 | `window.electronAPI.skill` のみ                                                            |

### 1.3 agentSlice 個別セレクタ完全リスト（23個）

#### 状態セレクタ（13個）

| #   | Hook名                         | 対応するStore状態         | index.ts export名            |
| --- | ------------------------------ | ------------------------- | ---------------------------- |
| 1   | `useAvailableSkillsMetadata()` | `availableSkillsMetadata` | `useAvailableSkillsMetadata` |
| 2   | `useImportedSkills()`          | `importedSkills`          | `useImportedSkills`          |
| 3   | `useSelectedSkillName()`       | `selectedSkillName`       | `useSelectedSkillName`       |
| 4   | `useIsSkillExecuting()`        | `isExecuting`             | `useIsSkillExecuting`        |
| 5   | `useSkillExecutionId()`        | `executionId`             | `useSkillExecutionId`        |
| 6   | `useSkillExecutionStatus()`    | `skillExecutionStatus`    | `useSkillExecutionStatus`    |
| 7   | `useStreamingMessages()`       | `streamingMessages`       | `useStreamingMessages`       |
| 8   | `usePendingSkillPermission()`  | `pendingPermission`       | `usePendingSkillPermission`  |
| 9   | `useSkillError()`              | `skillError`              | `useSkillError`              |
| 10  | `useIsLoadingSkills()`         | `isLoadingSkills`         | `useIsLoadingSkills`         |
| 11  | `useIsScanningSkills()`        | `isScanning`              | `useIsScanningSkills`        |
| 12  | `useIsImportingSkill()`        | `isImporting`             | `useIsImportingSkill`        |
| 13  | `useImportingSkillName()`      | `importingSkillName`      | `useImportingSkillName`      |

#### アクションセレクタ（10個）

| #   | Hook名                          | 対応するStoreアクション    | index.ts export名             |
| --- | ------------------------------- | -------------------------- | ----------------------------- |
| 14  | `useFetchSkills()`              | `fetchSkills`              | `useFetchSkills`              |
| 15  | `useRescanSkills()`             | `rescanSkills`             | `useRescanSkills`             |
| 16  | `useImportSkill()`              | `importSkill`              | `useImportSkill`              |
| 17  | `useRemoveSkill()`              | `removeSkill`              | `useRemoveSkill`              |
| 18  | `useSelectSkillByName()`        | `selectSkillByName`        | `useSelectSkillByName`        |
| 19  | `useExecuteSkill()`             | `executeSkill`             | `useExecuteSkill`             |
| 20  | `useAbortSkillExecution()`      | `abortExecution`           | `useAbortSkillExecution`      |
| 21  | `useRespondToSkillPermission()` | `respondToSkillPermission` | `useRespondToSkillPermission` |
| 22  | `useClearSkillError()`          | `clearSkillError`          | `useClearSkillError`          |
| 23  | `useClearStreamingMessages()`   | `clearStreamingMessages`   | `useClearStreamingMessages`   |

---

## 2. 機能要件（FR）

| FR ID  | 要件                                                                      | 優先度 | 状態   |
| ------ | ------------------------------------------------------------------------- | ------ | ------ |
| FR-001 | agentSlice.selectors.test.ts の全48テストを renderHook パターンに移行する | 高     | 未実施 |
| FR-002 | 全Sliceテスト（authMode/llm/agent）で参照安定性テストが実施されている     | 高     | 未実施 |
| FR-003 | 全Sliceテストで再レンダリング時の値更新テストが実施されている             | 中     | 未実施 |
| FR-004 | 既存テストの全48件がPASSを維持する                                        | 高     | 未実施 |
| FR-005 | 3つのSliceテストファイル間でテストパターンが統一されている                | 中     | 未実施 |

### FR-001 詳細

- 独立ストア `create<AgentSlice>()` から統合ストア `useAppStore` への切り替え
- `testStore.getState().xxx` を `renderHook(() => useAppStore(s => s.xxx))` に変換
- electronAPI モックを skill のみから authMode + llm + skill の3セクション全体に拡張
- afterEach に `cleanup()` と `vi.restoreAllMocks()` を追加

### FR-002 詳細

- renderHook の `rerender()` を使用して、再レンダリング後にアクション関数の参照が同一であることを検証
- authModeSlice/llmSlice では既に実装済みのパターンを agentSlice にも適用

### FR-003 詳細

- `act(() => useAppStore.setState({...}))` で状態変更後、`result.current` が新しい値を返すことを検証

### FR-004 詳細

- 移行前のテストケース数（48件）が移行後も全てPASSすること
- テスト名（TS-STORE-01 -- TS-STORE-48）を維持

### FR-005 詳細

- import パターンの統一（`renderHook, cleanup, act` from `@testing-library/react`）
- beforeEach/afterEach パターンの統一
- モック設定の統一（`createMockElectronAPI()` + `resetStore()`）

---

## 3. 非機能要件（NFR）

| NFR ID  | 要件                             | 優先度 | 基準値                       | 状態   |
| ------- | -------------------------------- | ------ | ---------------------------- | ------ |
| NFR-001 | カバレッジが移行前と同等以上     | 高     | Line 80%以上、Branch 60%以上 | 未実施 |
| NFR-002 | テスト実行時間が大幅に増加しない | 中     | 移行前比 +20% 以内           | 未実施 |
| NFR-003 | TypeScript型エラーが0件          | 高     | `pnpm typecheck` エラー0     | 未実施 |
| NFR-004 | happy-dom環境で全テスト正常動作  | 高     | Vitest happy-dom環境PASS     | 未実施 |

---

## 4. 参照資料

| 参照資料                     | パス                                                                               | 内容                              |
| ---------------------------- | ---------------------------------------------------------------------------------- | --------------------------------- |
| 既知の落とし穴（P31）        | `.claude/rules/06-known-pitfalls.md`                                               | Zustand Store Hooks無限ループ問題 |
| 状態管理ルール               | `.claude/rules/03-state-management.md`                                             | Zustand設計原則                   |
| agentSliceテスト（移行対象） | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.selectors.test.ts`    | getState()パターン使用中          |
| authModeSliceテスト（手本）  | `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.selectors.test.ts` | renderHookパターン使用中          |
| llmSliceテスト（手本）       | `apps/desktop/src/renderer/store/slices/__tests__/llmSlice.selectors.test.ts`      | renderHookパターン使用中          |
| Store index（セレクタ定義）  | `apps/desktop/src/renderer/store/index.ts`                                         | 個別セレクタHookのexport一覧      |

---

## 5. 設計原則

- **1 selector = 1 field**: 各セレクタHookは単一の状態フィールドまたはアクションを返す（lessons-learned.md由来）
- **P31対策**: 個別セレクタを使用し、合成Store Hookの戻り値関数をuseEffect依存配列に含めない
- **P9対策**: テスト間で状態を共有しない（beforeEachでresetStore()実行）
