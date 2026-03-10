# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001 |
| Phase      | 4                                           |
| Phase名    | テスト作成                                  |
| カテゴリ   | 改善                                        |
| ステータス | not_started                                 |
| 前提Phase  | Phase 3                                     |
| 後続Phase  | Phase 5                                     |

## 目的

Phase 5 の実装に先立ち、`debug-clear-storage` 残骸の除去を検証するテストをテストファーストで設計・実装する。テストが RED 状態（残骸が検出されて FAIL）であることを確認した上で、Phase 5 の実装により GREEN に転換させる。

## 実行タスク

- タスク1: `debug-clear-storage` 残存チェック自動テストを作成する
- タスク2: e2e global-setup の preflight 検証テストを作成する
- タスク3: `localStorage.clear()` 呼び出し検証テストを作成する

### タスク1: `debug-clear-storage` 残存チェック自動テスト

**目的**: repo 全体に `debug-clear-storage` 文字列が残存していないことを自動検証する

**テストファイル**: `apps/desktop/src/__tests__/debug-clear-storage-remnant.test.ts`

**テストケース設計**:

| #   | テストケース                                                                     | 期待結果                              | 対応AC |
| --- | -------------------------------------------------------------------------------- | ------------------------------------- | ------ |
| 1-1 | `apps/` 配下のソースコード（`.ts`/`.tsx`）に `debug-clear-storage` が存在しない  | テスト PASS（Phase 5 実装後に GREEN） | AC-1   |
| 1-2 | `scripts/` 配下に `debug-clear-storage` が存在しない                             | テスト PASS（Phase 5 実装後に GREEN） | AC-1   |
| 1-3 | `sessionStorage.setItem` で `debug-clear-storage` をセットするコードが存在しない | テスト PASS（Phase 5 実装後に GREEN） | AC-2   |

**実装方針**:

- `child_process.execSync` で `rg` コマンドを実行し、検出結果を assert する
- テスト実行環境に `ripgrep` が存在しない場合は `grep -rn` にフォールバックする
- `docs/30-workflows/` 配下の仕様書（本タスク自身の記述）は除外パターンに含める
- `outputs/` 配下のドキュメント成果物も除外する

**注意事項**:

- テスト間で状態を共有しない（P9 準拠）
- 各テストケースは独立して実行可能であること

### タスク2: e2e global-setup の preflight 検証テスト

**目的**: e2e global-setup が `debug-clear-storage` を前提としない正常な preflight を行うことを検証する

**テストファイル**: `apps/desktop/src/__tests__/e2e-global-setup-no-debug-storage.test.ts`

**テストケース設計**:

| #   | テストケース                                                                      | 期待結果                                           | 対応AC |
| --- | --------------------------------------------------------------------------------- | -------------------------------------------------- | ------ |
| 2-1 | `e2e/global-setup.ts` のソースコードに `debug-clear-storage` が含まれない         | テスト PASS（Phase 5 実装後に GREEN）              | AC-3   |
| 2-2 | `e2e/global-setup.ts` が `VITE_E2E_MODE` または `skipAuth` で認証バイパスする設計 | 認証バイパス機構が維持されていること               | AC-3   |
| 2-3 | `e2e/global-setup.ts` に不要な `sessionStorage` 操作が含まれない                  | `sessionStorage.setItem` が debug 目的で存在しない | AC-3   |

**実装方針**:

- ファイル内容を `fs.readFileSync` で読み込み、文字列パターンを検証する
- `debug-clear-storage` を含む行が存在しないことを assert する
- `VITE_E2E_MODE` / `skipAuth` の存在は肯定条件として検証する

### タスク3: `localStorage.clear()` 呼び出し検証テスト

**目的**: `localStorage.clear()` が意図しない箇所（特に App shell / 初期化フロー）で呼ばれないことを検証する

**テストファイル**: `apps/desktop/src/__tests__/no-unintended-localstorage-clear.test.ts`

**テストケース設計**:

| #   | テストケース                                                                            | 期待結果                                            | 対応AC |
| --- | --------------------------------------------------------------------------------------- | --------------------------------------------------- | ------ |
| 3-1 | `App.tsx` に `localStorage.clear()` が含まれない                                        | テスト PASS（親タスクで既に削除済みのため即 GREEN） | AC-7   |
| 3-2 | `renderer/` 配下の初期化ファイルに `localStorage.clear()` が含まれない                  | テスト PASS                                         | AC-7   |
| 3-3 | `preload/` 配下に `localStorage.clear()` が含まれない                                   | テスト PASS                                         | AC-7   |
| 3-4 | テストヘルパー / e2e 内の `localStorage.clear()` は `beforeEach` スコープ内に限定される | テスト用途の clear は許容（スコープ確認のみ）       | AC-7   |

**実装方針**:

- ソースコードの静的解析でパターン検出する
- テストファイル（`*.test.ts` / `*.spec.ts`）内の `localStorage.clear()` は `beforeEach` / `afterEach` 内に限定されることを検証する
- happy-dom 環境では `fireEvent` を使用する（P39 準拠）
- `window.location.reload()` の不正呼び出しも合わせて検証する

## 参照資料

| 参照資料       | パス                                                                           | 説明                     |
| -------------- | ------------------------------------------------------------------------------ | ------------------------ |
| Phase 1 成果物 | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-1/`          | 棚卸し結果・検出箇所一覧 |
| Phase 2 成果物 | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-2/`          | 変更計画・副作用分析     |
| Phase 3 成果物 | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-3/`          | 設計レビュー結果         |
| 親タスクテスト | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/` | 親タスクのテスト設計     |

### システム仕様（aiworkflow-requirements）

> テスト設計時に以下のシステム仕様を参照し、テストパターンとカバレッジ基準に準拠してください。

| 参照資料             | パス                                                                              | 内容                                           |
| -------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------- |
| コンポーネントテスト | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | happy-dom / localStorage polyfill / テスト設計 |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | テストカバレッジ基準・TDD 方針                 |
| E2Eテスト            | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`        | E2E テスト設計方針・preflight 設計             |
| 教訓集               | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | P9/P13/P39/P40 テスト関連の教訓                |
| 開発ガイドライン     | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`     | debug コード管理ルール                         |

## 統合テスト連携

- 本 Phase のテストは Phase 5 実装前に RED 状態であることを確認する（タスク1 のテスト1-1〜1-3、タスク2 のテスト2-1/2-3）
- Phase 5 実装後に全テストが GREEN に転換することを検証する
- Phase 6 で e2e / screenshot の統合テストを拡充する

## 成果物

| 成果物                          | パス                                                                   |
| ------------------------------- | ---------------------------------------------------------------------- |
| 残存チェックテスト              | `apps/desktop/src/__tests__/debug-clear-storage-remnant.test.ts`       |
| e2e global-setup 検証テスト     | `apps/desktop/src/__tests__/e2e-global-setup-no-debug-storage.test.ts` |
| localStorage.clear() 検証テスト | `apps/desktop/src/__tests__/no-unintended-localstorage-clear.test.ts`  |

## 完了条件

- [ ] タスク1〜3 の全テストファイルが作成されていること
- [ ] 各テストケースが独立して実行可能であること（P9 準拠）
- [ ] happy-dom 環境で `userEvent` を使用していないこと（P39 準拠）
- [ ] テスト間で状態を共有していないこと（P9 準拠）
- [ ] `debug-clear-storage` 残存チェックテストが現時点で RED（残骸が検出されて FAIL）であること
- [ ] `localStorage.clear()` の App.tsx 検証テスト（3-1）が GREEN であること（親タスクで削除済み）
- [ ] `pnpm --filter @repo/desktop exec vitest run` で既存テストが破壊されていないこと（P40 準拠）
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 5: 実装へ進む。RED 状態のテストを GREEN に転換させる実装を行う。
