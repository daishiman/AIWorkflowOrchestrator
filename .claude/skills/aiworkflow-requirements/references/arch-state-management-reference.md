# 状態管理パターン（Desktop Renderer） / reference bundle

> 親仕様書: [arch-state-management.md](arch-state-management.md)
> 役割: reference bundle

## P31対策: Store Hooks無限ループ防止パターン

> 参照: [06-known-pitfalls.md#P31](../../../rules/06-known-pitfalls.md#p31-zustand-store-hooks無限ループ)

### Store Hooks テスト実装ガイド

> **UT-STORE-HOOKS-TEST-REFACTOR-001 で確立**（2026-02-12）

個別セレクタHookのテストは `@testing-library/react` の `renderHook` パターンを使用する。

#### テストパターン一覧

| テスト対象 | パターン | 検証例 |
|---|---|---|
| 状態セレクタ初期値 | `renderHook(() => useField())` | `expect(result.current).toEqual([])` |
| 状態変更検証 | `act(() => useAppStore.setState({...}))` | setState後のresult.current検証 |
| アクション実行 | `await act(async () => { ... })` | 非同期アクションのact()ラップ |
| 関数参照安定性 | `rerender()` 後の `toBe()` | Zustandアクション参照不変性の確認 |
| 無限ループ防止 | `useEffect + useRef + renderHook` | P31対策テスト（レンダー回数5未満を検証） |
| 再レンダー最適化 | 無関係setState後の値不変確認 | 個別セレクタの分離検証（`toBe()` で参照同一性確認） |

#### テスト環境要件

| 要件 | 設定値 |
|---|---|
| テスト環境 | `@vitest-environment happy-dom` |
| localStorage | ポリフィル設定必須 |
| electronAPI | `window.electronAPI` 完全モック（authMode + llm + skill セクション） |
| ストア | `useAppStore` 統合ストア使用 |
| beforeEach | `vi.clearAllMocks()` + electronAPI設定 + `resetStore()` |
| afterEach | `cleanup()` + `vi.restoreAllMocks()` |

#### テスト実績

| テストファイル | テスト数 | パターン | 関連タスク |
|---|---|---|---|
| `authModeSlice.selectors.test.ts` | 70+ | renderHook | UT-STORE-HOOKS-REFACTOR-001 |
| `llmSlice.selectors.test.ts` | 60+ | renderHook | UT-STORE-HOOKS-REFACTOR-001 |
| `agentSlice.selectors.test.ts` | 114 | renderHook | UT-STORE-HOOKS-TEST-REFACTOR-001（移行完了） |
| `agentSlice.boundary.test.ts` | 203行 | 境界値テスト | TASK-043D |
| `agentSlice.combination.test.ts` | 321行 | 組み合わせテスト | TASK-043D |
| `agentSlice.edge-cases.test.ts` | 305行 | エッジケーステスト | TASK-043D |
| `agentSlice.error-cases.test.ts` | 283行 | エラーケーステスト | TASK-043D |
| `agentSlice.extension.test.ts` | 188行 | 拡張テスト | TASK-043D |
| `agentSlice.import-lifecycle.test.ts` | 283行 | インポートライフサイクルテスト | TASK-043D |
| `agentSlice.p31-regression.test.ts` | 303行 | P31回帰テスト | TASK-043D |
| `customStorage.test.ts` | 184行 | persist復旧3段ガードテスト | TASK-043D |
| `navigationSlice.test.ts`（iterable hardening追加分） | 57行追加 | viewHistory破損時ガードテスト | TASK-043D |
| `SkillAnalysisView.store-integration.test.tsx` | 221行 | Store統合テスト（hook+Store+IPC分離） | TASK-043D |
| `SkillCreateWizard.store-integration.test.tsx` | 171行 | Store統合テスト（hook+Store+IPC分離） | TASK-043D |

**関連タスク**: UT-STORE-HOOKS-TEST-REFACTOR-001（agentSliceテスト移行）, UT-STORE-HOOKS-REFACTOR-001（個別セレクタ設計）, TASK-043D（テスト品質ゲート設計）

### 将来の開発者向けガイダンス

#### P31問題発生時のチェックリスト

1. **症状の確認**
   - [ ] 画面がローディング状態のまま止まらない
   - [ ] DevToolsでStateの更新が連続している
   - [ ] コンソールに大量のログが出力されている

2. **原因の特定**
   - [ ] `useEffect` の依存配列にStore関数が含まれているか確認
   - [ ] 合成Hook（`useXxxStore()`）を使用しているか確認
   - [ ] 依存配列の関数が毎回新しい参照になっていないか確認

3. **修正の適用**
   - [ ] useRefガードパターンを適用
   - [ ] 依存配列を空にする
   - [ ] P31対策コメントを追加
   - [ ] eslint-disable コメントを追加（必要な場合）

4. **検証**
   - [ ] 無限ループが解消されたか確認
   - [ ] 初期化処理が1回だけ実行されているか確認
   - [ ] DevToolsでState更新が落ち着いているか確認

#### コードレビュー時の確認項目

| 確認項目                                              | 判定基準                                             |
| ----------------------------------------------------- | ---------------------------------------------------- |
| 合成HookからのStore関数を依存配列に含めていないか     | 空の依存配列 + useRefガード、またはeslint-disable   |
| P31対策コメントが追加されているか                     | `// P31対策:` または `// 意図的に空の依存配列`       |
| 初期化処理が1回のみ実行されることが保証されているか   | useRefガード or モジュールスコープフラグ             |

---

## chatEditSlice（Workspace Chat Edit状態管理）

### 概要

AIによるコード編集機能の状態管理Slice。ファイルコンテキスト、LLM生成結果、差分プレビューのUI状態を管理する。

**実装場所**: `apps/desktop/src/renderer/features/workspace-chat-edit/store/`

### 状態定義

| プロパティ          | 型                  | 説明                       |
| ------------------- | ------------------- | -------------------------- |
| `fileContexts`      | `FileContext[]`     | 添付ファイル一覧           |
| `activeContextId`   | `string \| null`    | アクティブなコンテキストID |
| `generatedResults`  | `GeneratedResult[]` | 生成結果一覧               |
| `currentResultId`   | `string \| null`    | 現在表示中の結果ID         |
| `isLoading`         | `boolean`           | ローディング中             |
| `isDiffPreviewOpen` | `boolean`           | 差分プレビュー表示中       |
| `error`             | `string \| null`    | エラーメッセージ           |
| `isDragging`        | `boolean`           | ドラッグ中                 |

### アクション定義

| アクション           | 引数                                 | 説明                     |
| -------------------- | ------------------------------------ | ------------------------ |
| `addFileContext`     | `Omit<FileContext, 'id'\|'addedAt'>` | ファイルコンテキスト追加 |
| `removeFileContext`  | `id: string`                         | コンテキスト削除         |
| `clearAllContexts`   | -                                    | 全クリア                 |
| `setActiveContext`   | `id: string \| null`                 | アクティブ設定           |
| `setGeneratedResult` | `result: GeneratedResult`            | 生成結果設定             |
| `approveResult`      | `resultId: string`                   | 適用                     |
| `rejectResult`       | `resultId: string`                   | 却下                     |
| `clearResults`       | -                                    | 結果クリア               |
| `openDiffPreview`    | `resultId: string`                   | プレビュー表示           |
| `closeDiffPreview`   | -                                    | プレビュー非表示         |
| `setLoading`         | `loading: boolean`                   | ローディング設定         |
| `setError`           | `error: string \| null`              | エラー設定               |
| `setDragging`        | `dragging: boolean`                  | ドラッグ状態設定         |
| `reset`              | -                                    | 状態リセット             |

### 関連Hooks

| Hook名           | 責務                     |
| ---------------- | ------------------------ |
| `useFileContext` | ファイルコンテキスト管理 |
| `useDiffApply`   | 差分計算・適用ロジック   |

### 実装パターン

- **Helper関数分離**: 複雑なロジックをSlice外部に分離（`computeLCS`, `generateDiffHunks`等）
- **バリデーション内蔵**: `addFileContext`で`MAX_FILE_CONTEXTS`, `MAX_FILE_SIZE`チェック
- **Optional Chainingによる安全性**: `state.chatEdit?.fileContexts ?? []`パターン

### Store統合（予定）

**統合先ファイル**: `apps/desktop/src/renderer/store/index.ts`

**必要なimport**:

| インポート対象        | インポート元                              |
| --------------------- | ----------------------------------------- |
| `createChatEditSlice` | `@/renderer/features/workspace-chat-edit` |
| `ChatEditSlice`       | `@/renderer/features/workspace-chat-edit` |

**Store統合手順**:

1. `AppStore`インターフェースに`ChatEditSlice`をextends追加
2. `create`関数内でスプレッド構文により`createChatEditSlice(set, get)`を展開
3. 他のSliceと同様のパターンで統合

**統合パターン**:

| 要素               | 説明                                         |
| ------------------ | -------------------------------------------- |
| `AppStore`         | 全Sliceを統合したストア型定義                |
| `create<AppStore>` | Zustandのcreate関数で型付きストア生成        |
| `set, get`         | StateCreator関数に渡すコールバック           |
| スプレッド展開     | 各Sliceを`...createXxxSlice(set, get)`で統合 |

### 品質メトリクス

- テストカバレッジ: Line 69.23%, Branch 89.74%, Function 95%
- 全122件の自動テスト成功

### 関連タスク

- workspace-chat-edit（2026-01-23完了：コアロジック）

---

## skillSlice（統合済み - TASK-FIX-6-1-STATE-CENTRALIZATION）

> **注記**: このSliceは TASK-FIX-6-1-STATE-CENTRALIZATION（2026-02-10）で agentSlice に統合されました。
> 以下は統合前の仕様を参考情報として保持しています。

### 統合先

**agentSlice** に以下の状態・アクションが統合されています:

| 項目 | 統合後の位置 |
| ---- | ------------ |
| 状態（14プロパティ） | agentSlice内にそのまま移行 |
| アクション（10メソッド） | agentSlice内にそのまま移行 |
| 内部ハンドラー（4メソッド） | agentSlice内の`_handle*`メソッド |
| IPCリスナー設定 | setupSkillListeners.ts（agentSlice参照） |

### race condition対策（TASK-FIX-6-1で追加）

| 項目 | 説明 |
| ---- | ---- |
| executionId事前生成 | executeSkill()開始時にUUID生成、IPC呼び出し前にState設定 |
| フィルタリング | _handleStreamMessage等でexecutionIdを検証 |
| 目的 | ストリームイベント到着時の状態不整合を防止 |

### 並行実行ガードパターン（Concurrency Guard）（TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001で追加）

`executeSkill` アクション内で `get().isExecuting` による同期的チェックを行い、実行中の再呼び出しを早期リターンでブロックする。

#### 設計原則

| 項目 | 内容 |
|------|------|
| ガード方式 | 同期的 `get().isExecuting` チェック（async 操作前に配置） |
| 配置位置 | `executeSkill` 関数冒頭、`selectedSkillName` チェック直後 |
| 防御層 | Store層ガード（FR-01）+ UIガード面3箇所の二重防御 |
| 状態復元 | `_handleComplete` / `_handleError` で `isExecuting: false` に復元 |
| `get()` の安全性 | Zustand `get()` は React レンダーサイクル非依存の同期取得のため、ミリ秒単位の連打でも確実にガード |
| P31対策 | UI層では個別セレクタ `useIsSkillExecuting()` を使用（ChatPanel も移行済み） |
| Phase 11証跡 | `TC-11-01..03` の screenshot で AgentView / AgentExecutionView / ChatPanel の実行中状態を確認 |

#### 実装コード

```typescript
executeSkill: async (prompt) => {
  const { selectedSkillName, isExecuting } = get();
  if (!selectedSkillName) return;

  // 並行実行ガード: 既に実行中の場合は即座に拒否（FR-01）
  if (isExecuting) return;

  // ここから先は isExecuting = true に設定してから async 操作
  set({ isExecuting: true, skillExecutionStatus: "running", ... });
  // ...
};
```

#### UIガード面（既存・回帰確認済み）

| コンポーネント | ファイル | ガード方式 | P31安全性 |
|----------------|----------|------------|-----------|
| ExecuteButton | `components/organisms/AgentView/ExecuteButton.tsx` | `if (isExecuting) return null` — null render | Props経由（安全） |
| AgentExecutionView | `views/AgentExecutionView/AgentExecutionView.tsx` | `disabled={isExecuting}` on AgentMessageInput | ローカル派生（安全） |
| ChatPanel | `components/chat/ChatPanel.tsx` | `useIsSkillExecuting()` で toggle disabled を制御 | 個別セレクタ（P31安全） |

#### ガード保証テスト

| テストID | 検証内容 | AC |
|----------|----------|-----|
| T-01 | isExecuting=false で正常実行 | AC-01 |
| T-02 | isExecuting=true で即座に return | AC-01 |
| T-03 | ガード拒否時 streamingMessages 不変 | AC-02 |
| T-04 | ガード拒否時 executionId 不変 | AC-03 |
| T-05 | 連続2回呼び出しで2回目がガード | AC-01 |
| T-09 | エラー後 isExecuting=false に復元 | - |
| T-10 | 完了後に再実行可能 | - |
| T-11 | selectedSkillName 未設定で早期 return | - |
| T-12 | 3回連続で2回目・3回目がガード | AC-01 |

**関連未タスク**:
- UT-FIX-CANCEL-SKILL-CONCURRENCY-GUARD-001: `abortExecution` にも同様のガードが必要な可能性（`docs/30-workflows/completed-tasks/unassigned-task/task-fix-cancel-skill-concurrency-guard-001.md`）
- UT-IMP-AGENTSLICE-TEST-CREATESTORE-PATTERN-STANDARDIZATION-001: `createStore` / `mockElectronAPI` / `flushMicrotasks` の共通ヘルパー抽出（`docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-agentslice-test-createstore-pattern-standardization-001.md`）
- UT-FIX-AGENTSLICE-EXISTING-TEST-ENV-DEPENDENCY-001: agentSlice 既存テスト13ファイルの環境依存エラー修復（`docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-fix-agentslice-existing-test-env-dependency-001.md`）
- UT-IMP-PHASE4-MONOREPO-TEST-DIRECTORY-GUARD-001: Phase 4 テンプレートへのモノレポテスト実行ディレクトリガード追加（`docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-phase4-monorepo-test-directory-guard-001.md`）

#### 実装時の苦戦箇所と短縮手順

| 苦戦箇所 | 再発条件 | 標準対処 |
|----------|----------|----------|
| `validate-phase-output --phase` の誤案内 | template / system spec / workflow 本文の例が実スクリプトより古い | `validate-phase-output.js <workflow-dir>` を正本とし、関連 docs を同一ターンで修正する |
| BrowserRouter 配下の harness に `MemoryRouter` を重ねる | screenshot review 用 route を急いで作るとき | 既存 Router の descendant route として描画し、harness 内で Router を再生成しない |
| Phase 11/12 成果物だけ更新し workflow 本文や index を置き去りにする | validator PASS 後に文書同期を後回しにするとき | `phase-12-documentation.md` / `artifacts.json` / `outputs/artifacts.json` / `index.md` を同ターンで更新する |

#### 同種課題の5分解決カード

1. Store の async action 冒頭に同期 guard を置く。
2. UI 側は既存 selector を流用し、Store guard を最終防衛線にする。
3. review harness は既存 Router 配下で描画し、二重 Router を避ける。
4. `validate-phase-output` / `validate-phase12-implementation-guide` / `verify-all-specs` を連続実行する。
5. 成果物、workflow 本文、system spec、未タスク台帳を同一ターンで同期する。

---

<details>
<summary>統合前の仕様（参考情報）</summary>

> 注記: 以下は統合前の履歴情報。UT-TYPE-SKILL-IDENTIFIER-BRANDED-001（2026-02-25）以降、実装側は `SkillId` / `SkillName` のBranded Typeを使用する。

### 概要

スキル機能の状態管理Slice。スキルのスキャン・インポート・選択・実行・権限確認の状態を一元管理する。IPCイベントを介してMain Processと連携し、ストリーミング応答や権限リクエストを処理する。

**実装ファイル**:

| ファイル                 | パス                                                     | 行数 | 説明                         |
| ------------------------ | -------------------------------------------------------- | ---- | ---------------------------- |
| `skillSlice.ts`          | `apps/desktop/src/renderer/store/slices/skillSlice.ts`   | 347  | Slice定義（状態+アクション） |
| `setupSkillListeners.ts` | `apps/desktop/src/renderer/store/setupSkillListeners.ts` | 49   | IPCイベントリスナー設定      |

**テストファイル**:

| ファイル                              | テスト数 | カテゴリ     |
| ------------------------------------- | -------- | ------------ |
| `skillSlice.test.ts`                  | 59       | 基本機能     |
| `skillSlice.edge-cases.test.ts`       | 16       | エッジケース |
| `skillSlice.state-transition.test.ts` | 17       | 状態遷移     |
| `skillSlice.ipc.test.ts`              | 14       | IPC連携      |
| `skillSlice.integration.test.ts`      | 7        | 統合テスト   |

### 状態定義（14プロパティ）

| プロパティ           | 型                               | 初期値  | 説明                     |
| -------------------- | -------------------------------- | ------- | ------------------------ |
| `availableSkills`    | `SkillMetadata[]`                | `[]`    | 利用可能なスキル一覧     |
| `importedSkills`     | `ImportedSkill[]`                | `[]`    | インポート済みスキル一覧 |
| `selectedSkillName`  | `string \| null`                 | `null`  | 選択中のスキル名         |
| `isExecuting`        | `boolean`                        | `false` | 実行中フラグ             |
| `executionId`        | `string \| null`                 | `null`  | 現在の実行ID             |
| `executionStatus`    | `SkillExecutionStatus \| null`   | `null`  | 実行ステータス           |
| `streamingMessages`  | `SkillStreamMessage[]`           | `[]`    | ストリーミングメッセージ |
| `handoffGuidance`    | `HandoffGuidance \| null`        | `null`  | terminal handoff ガイダンス |
| `pendingPermission`  | `SkillPermissionRequest \| null` | `null`  | 保留中の権限リクエスト   |
| `skillError`         | `string \| null`                 | `null`  | エラー情報               |
| `isLoadingSkills`    | `boolean`                        | `false` | スキル一覧読み込み中     |
| `isScanning`         | `boolean`                        | `false` | スキルスキャン中         |
| `isImporting`        | `boolean`                        | `false` | スキルインポート中       |
| `importingSkillName` | `string \| null`                 | `null`  | インポート中のスキル名   |

### アクション定義（10メソッド）

| アクション               | シグネチャ                                        | 説明                           |
| ------------------------ | ------------------------------------------------- | ------------------------------ |
| `fetchSkills`            | `() => Promise<void>`                             | スキル一覧取得                 |
| `rescanSkills`           | `() => Promise<void>`                             | スキル再スキャン               |
| `importSkill`            | `(skillName: string) => Promise<void>`            | スキルインポート               |
| `removeSkill`            | `(skillName: string) => Promise<void>`            | スキル削除                     |
| `selectSkill`            | `(skillName: string \| null) => void`             | スキル選択                     |
| `executeSkill`           | `(prompt: string) => Promise<void>`               | スキル実行（並行実行ガード付き: `isExecuting` 同期チェック、FR-01） |
| `abortExecution`         | `() => void`                                      | 実行中断                       |
| `respondToPermission`    | `(approved: boolean, remember?: boolean) => void` | 権限リクエスト応答             |
| `clearError`             | `() => void`                                      | エラークリア                   |
| `clearStreamingMessages` | `() => void`                                      | ストリーミングメッセージクリア |
| `clearHandoffGuidance`   | `() => void`                                      | handoff カードを閉じる         |

### Runtime routing / handoff 状態契約（2026-03-15 同期）

`skill:execute` / `agent:start` の handoff 応答は `agentSlice` を単一正本として保持する。

| イベント | Store 更新 |
| --- | --- |
| `handoff=true` 応答を受信 | `handoffGuidance` を設定し、`isExecuting=false` に戻す |
| integrated 実行開始 | `handoffGuidance=null` を先に設定して stale card を防止 |
| Dismiss 操作 | `clearHandoffGuidance()` で `handoffGuidance=null` |

| セレクタ / 参照先 | 用途 |
| --- | --- |
| `useHandoffGuidance()` | `TerminalHandoffCard` の表示条件 |
| `useIsSkillExecuting()` | handoff 後の入力再開制御（P31安全な個別セレクタ） |

### 内部ハンドラー（4メソッド）

IPCイベントを受信して状態を更新する内部ハンドラー。`setupSkillListeners.ts`から呼び出される。

| ハンドラー                 | シグネチャ                                     | トリガーIPC                |
| -------------------------- | ---------------------------------------------- | -------------------------- |
| `_handleStreamMessage`     | `(msg: SkillStreamMessage) => void`            | `skill:stream`             |
| `_handleComplete`          | `(executionId: string) => void`                | `skill:complete`           |
| `_handleError`             | `(executionId: string, error: string) => void` | `skill:error`              |
| `_handlePermissionRequest` | `(req: SkillPermissionRequest) => void`        | `skill:permission-request` |

### IPCリスナー設定パターン

`setupSkillListeners.ts`はアプリ初期化時に一度だけ呼び出し、クリーンアップ関数を返す。

**設定タイミング**: App.tsxの`useEffect`内

**クリーンアップ**: アンマウント時にリスナーを解除

| リスナー              | IPCチャネル                | 対応ハンドラー             |
| --------------------- | -------------------------- | -------------------------- |
| `onStream`            | `skill:stream`             | `_handleStreamMessage`     |
| `onComplete`          | `skill:complete`           | `_handleComplete`          |
| `onError`             | `skill:error`              | `_handleError`             |
| `onPermissionRequest` | `skill:permission-request` | `_handlePermissionRequest` |

### Store統合

**統合先ファイル**: `apps/desktop/src/renderer/store/index.ts`

**セレクター**: `useSkillStore`

| インポート対象     | インポート元          |
| ------------------ | --------------------- |
| `createSkillSlice` | `./slices/skillSlice` |
| `SkillSlice`       | `./slices/skillSlice` |

**統合パターン**:

| 要素               | 説明                                            |
| ------------------ | ----------------------------------------------- |
| `AppStore`         | 全Sliceを統合したストア型定義にSkillSliceを追加 |
| `create<AppStore>` | Zustandのcreate関数でskillSliceを展開           |
| `useSkillStore`    | skillSlice専用セレクター（shallow比較）         |

### 品質メトリクス

| 指標              | 値     |
| ----------------- | ------ |
| テスト数          | 113    |
| Line Coverage     | 100%   |
| Branch Coverage   | 98.21% |
| Function Coverage | 100%   |
| TypeScript strict | PASS   |
| ESLint            | PASS   |

### 関連タスク

| タスクID                            | 内容                           | ステータス                                                                                               |
| ----------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| TASK-6-1                            | SkillSlice実装（Zustand）      | **完了**                                                                                                 |
| TASK-7A                             | SkillSelector                  | **完了**                                                                                                 |
| TASK-7B                             | SkillImportDialog              | **完了**                                                                                                 |
| TASK-7C                             | PermissionDialog               | **完了**                                                                                                 |
| task-imp-permission-readable-ui-001 | PermissionDialog人間可読UI改善 | **完了**                                                                                                 |
| TASK-7D                             | ChatPanel統合                  | **完了**（[指示書](../../../docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-chatpanel-agent-integration.md)） |
| task-imp-permission-history-001     | Permission履歴トラッキングUI   | **完了**                                                                                                 |
| TASK-8B                             | コンポーネントテスト（全4コンポーネント+3ユーティリティ、280テスト） | **完了**                                                                                                 |

</details>

---
