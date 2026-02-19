# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 4                                   |
| 機能名 | TASK-FIX-10-1-VITEST-ERROR-HANDLING |
| 作成日 | 2026-02-19                          |

## 目的

修正対象テストのリグレッション防止テストを設計する。`dangerouslyIgnoreUnhandledErrors: false` の状態で未処理 Promise 拒否が検出されることを検証するテスト、および修正後の非同期エラーハンドリングの正しさを検証するテストを作成する。

## 実行タスク

- 未処理 Promise 拒否検出テスト: 意図的に unhandled rejection を発生させ、Vitest がそれを検出・報告することを検証するテストを作成する
- 非同期エラーハンドリングテスト: 修正対象の各パターン（P-AWAIT/P-CATCH/P-MOCK/P-CLEANUP/P-FIRE/P-TIMER）に対するリグレッション防止テストを作成する
- 既存テストの修正設計: Phase 1 で特定した失敗テストの修正内容をテストファイル単位で設計する

## 参照資料

| 資料名                 | パス                                                                  | 説明                     |
| ---------------------- | --------------------------------------------------------------------- | ------------------------ |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`                          | Phase 1 成果物           |
| 失敗テストリスト       | `outputs/phase-1/failing-tests-list.md`                               | カテゴリ別失敗テスト一覧 |
| 修正方針設計書         | `outputs/phase-2/fix-strategy-design.md`                              | Phase 2 成果物           |
| 設計レビュー結果       | `outputs/phase-3/design-review-result.md`                             | Phase 3 成果物           |
| エラーハンドリング仕様 | `.claude/skills/aiworkflow-requirements/references/error-handling.md` | エラーハンドリング方針   |
| テストセットアップ     | `apps/desktop/src/test/setup.ts`                                      | テスト環境セットアップ   |

## 実行手順

### ステップ 1: テストシナリオ設計

Phase 1 の受け入れ基準と Phase 2 の修正パターンからテストシナリオを導出する。

#### 1-1. Vitest 設定変更検証テスト

`dangerouslyIgnoreUnhandledErrors` が `false`（デフォルト）の状態で、テストスイートが未処理 Promise 拒否を検出することを確認するシナリオ:

| シナリオ ID | シナリオ名                                                  | 検証内容                                           |
| ----------- | ----------------------------------------------------------- | -------------------------------------------------- |
| S-CFG-01    | vitest.config.ts に dangerouslyIgnoreUnhandledErrors がない | 設定ファイルに当該設定が存在しないことを静的に検証 |

#### 1-2. パターン別リグレッションテスト

Phase 2 で定義した各パターンに対するリグレッション防止テスト:

| シナリオ ID | パターン  | テストシナリオ                                                               |
| ----------- | --------- | ---------------------------------------------------------------------------- |
| S-PAT-01    | P-AWAIT   | `async` 関数の戻り値を `await` することで、拒否が未処理にならない            |
| S-PAT-02    | P-CATCH   | エラーを期待するテストで、`.rejects.toThrow()` 後に未処理拒否が残らない      |
| S-PAT-03    | P-MOCK    | モック関数の `mockRejectedValue` が呼び出し元で正しくハンドリングされる      |
| S-PAT-04    | P-CLEANUP | `afterEach` の非同期クリーンアップが完了してからテストが終了する             |
| S-PAT-05    | P-FIRE    | fire-and-forget パターンのテストで、全 Promise が解決/拒否されてから終了する |
| S-PAT-06    | P-TIMER   | `vi.advanceTimersByTimeAsync` を使い、タイマー内の非同期処理が完了する       |

### ステップ 2: 既存テストファイルの修正計画

Phase 1 の失敗テストリストに基づき、各テストファイルで必要な修正を設計する。

修正対象テストファイルごとに以下を記録する:

| 項目             | 内容                                   |
| ---------------- | -------------------------------------- |
| ファイルパス     | 対象テストファイルの絶対パス           |
| パターン ID      | 該当する修正パターン（P-AWAIT 等）     |
| 修正内容         | 具体的な修正箇所と修正方法             |
| 影響するテスト数 | 修正により影響を受けるテストケースの数 |
| リスク           | 修正による副作用のリスク評価           |

### ステップ 3: 新規テスト作成

#### 3-1. Vitest 設定検証テスト

**ファイル配置**: `apps/desktop/src/test/vitest-config.test.ts`

このテストは `vitest.config.ts` から `dangerouslyIgnoreUnhandledErrors` 設定が削除されていることを検証する。設定ファイルの内容を静的に読み取り、当該設定が存在しないことを確認する。

テスト項目:

| テスト ID | テスト名                                                    | 検証内容                                              |
| --------- | ----------------------------------------------------------- | ----------------------------------------------------- |
| T-CFG-01  | dangerouslyIgnoreUnhandledErrors が設定ファイルに存在しない | vitest.config.ts を読み取り、当該設定がないことを確認 |

#### 3-2. 非同期エラーハンドリング検証テスト

**ファイル配置**: `apps/desktop/src/test/async-error-handling.test.ts`

修正後の非同期エラーハンドリングが正しく機能することを検証する。

テスト項目:

| テスト ID | テスト名                                               | 検証内容                                                          |
| --------- | ------------------------------------------------------ | ----------------------------------------------------------------- |
| T-AEH-01  | async 関数の拒否が expect().rejects で正しく捕捉される | `Promise.reject()` が `.rejects.toThrow()` で検証できることを確認 |
| T-AEH-02  | afterEach の非同期クリーンアップが完了する             | `afterEach(async () => ...)` が完了するまでテストが待機すること   |
| T-AEH-03  | モックの拒否がテスト内で処理される                     | `mockRejectedValue` の結果が `try/catch` で処理されることを確認   |
| T-AEH-04  | タイマー内の非同期処理がクリーンに完了する             | `vi.advanceTimersByTimeAsync` で非同期タイマーが正しく処理される  |

### ステップ 4: テストの実行確認（Red 状態）

```bash
# テスト実行（修正前のコードに対して新規テストを実行）
cd apps/desktop && pnpm vitest run src/test/vitest-config.test.ts
cd apps/desktop && pnpm vitest run src/test/async-error-handling.test.ts
```

Phase 4 時点では、`dangerouslyIgnoreUnhandledErrors: true` がまだ存在するため、設定検証テスト（T-CFG-01）は失敗する（Red 状態）。非同期エラーハンドリングテスト（T-AEH-01〜04）は、テストインフラの検証であるため PASS してもよい。

## 統合テスト連携【必須】

統合テストシナリオを設計する:

| シナリオカテゴリ   | 検証内容                                                        | テストファイル                                       |
| ------------------ | --------------------------------------------------------------- | ---------------------------------------------------- |
| エラーハンドリング | 非同期エラーが Vitest で検出されること                          | `apps/desktop/src/test/async-error-handling.test.ts` |
| 設定検証           | vitest.config.ts に dangerouslyIgnoreUnhandledErrors がないこと | `apps/desktop/src/test/vitest-config.test.ts`        |

## アーキテクチャ層別テスト

本タスクでは、テスト基盤（`src/test/`）に新規テストを配置する。修正対象の既存テストは各層に分散している:

| 層               | テスト観点                                            | テストファイル配置                       |
| ---------------- | ----------------------------------------------------- | ---------------------------------------- |
| テスト基盤       | Vitest 設定検証、非同期エラーハンドリング共通パターン | `apps/desktop/src/test/*.test.ts`        |
| Main Process     | サービステストの非同期エラー修正                      | `apps/desktop/src/main/**/*.test.ts`     |
| Renderer Process | コンポーネントテストの非同期エラー修正                | `apps/desktop/src/renderer/**/*.test.ts` |
| IPC通信          | IPC ハンドラテストの非同期エラー修正                  | `apps/desktop/src/main/ipc/**/*.test.ts` |

## 多角的チェック観点

| 観点               | 適用 | 確認項目                                                            |
| ------------------ | ---- | ------------------------------------------------------------------- |
| エラーハンドリング | 該当 | テストが error-handling.md の方針に沿ったエラー処理を検証しているか |
| アーキテクチャ     | 該当 | テストファイルの配置が層別に整理されているか                        |
| パフォーマンス     | 該当 | 新規テストの実行時間が許容範囲内か（個別テスト 10 秒以内）          |

**Electron デスクトップアプリ観点**:

| 層         | 適用 | 確認項目                                                                      |
| ---------- | ---- | ----------------------------------------------------------------------------- |
| テスト環境 | 該当 | happy-dom 環境で非同期テストが正しく動作するか（P39 参照）                    |
| モック     | 該当 | `@anthropic-ai/claude-agent-sdk` モックが非同期拒否を正しくシミュレートするか |

## 成果物

| 成果物                     | パス                                                 | 説明                               |
| -------------------------- | ---------------------------------------------------- | ---------------------------------- |
| テスト仕様書               | `outputs/phase-4/test-specification.md`              | テストシナリオとテスト項目の設計   |
| テストケース               | `outputs/phase-4/test-cases.md`                      | テストケース一覧                   |
| 既存テスト修正計画         | `outputs/phase-4/existing-test-fix-plan.md`          | ファイル別修正計画                 |
| 設定検証テストファイル     | `apps/desktop/src/test/vitest-config.test.ts`        | Vitest 設定検証テスト              |
| 非同期エラーテストファイル | `apps/desktop/src/test/async-error-handling.test.ts` | 非同期エラーハンドリング検証テスト |

## 完了条件

- [ ] テストシナリオ（S-CFG-01, S-PAT-01〜06）が設計されている
- [ ] Phase 1 の失敗テストリスト全件に対して修正計画が作成されている
- [ ] 設定検証テスト（`vitest-config.test.ts`）が作成されている
- [ ] 非同期エラーハンドリングテスト（`async-error-handling.test.ts`）が作成されている
- [ ] 設定検証テスト（T-CFG-01）が失敗状態（Red）であることを確認している
- [ ] 新規テストファイルの配置が `apps/desktop/src/test/` に正しく行われている
- [ ] happy-dom 環境で `userEvent` を使用していない（P39 対策、`fireEvent` を使用）
- [ ] テスト実行は `cd apps/desktop && pnpm vitest run` で行っている（P40 対策）
- [ ] テストカバレッジ目標が設定されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## TDD 検証

```bash
# テスト実行コマンド
cd apps/desktop && pnpm vitest run src/test/vitest-config.test.ts
cd apps/desktop && pnpm vitest run src/test/async-error-handling.test.ts

# 確認項目
# - [ ] T-CFG-01 が失敗することを確認（Red 状態）
# - [ ] T-AEH-01〜04 のテストが作成されている
```

## サブタスク管理

Phase 実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 1-3 成果物）
2. テストシナリオ設計（ステップ 1）
3. 既存テスト修正計画の作成（ステップ 2）
4. 設定検証テスト作成（ステップ 3-1）
5. 非同期エラーハンドリングテスト作成（ステップ 3-2）
6. Red 状態の確認（ステップ 4）
7. 成果物の作成・配置
8. 完了条件の検証

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-FIX-10-1-VITEST-ERROR-HANDLING --phase 4
```

## 次の Phase

Phase 5: 実装（TDD: Green）
