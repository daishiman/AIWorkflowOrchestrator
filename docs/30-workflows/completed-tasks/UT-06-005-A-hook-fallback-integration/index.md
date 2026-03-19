# UT-06-005-A: PreToolUse Hook フォールバック統合 + timeout→abort 遷移実装

## メタ情報

| 項目         | 内容                                                        |
| ------------ | ----------------------------------------------------------- |
| タスクID     | UT-06-005-A                                                 |
| タスク名     | PreToolUse Hook フォールバック統合 + timeout→abort 遷移実装 |
| 分類         | 実装                                                        |
| 対象機能     | SkillExecutor Permission Fallback                           |
| 優先度       | 高                                                          |
| 見積もり規模 | 中規模                                                      |
| ステータス   | Phase 1-12 完了（Phase 13 はユーザー承認待ち）              |
| 発見元       | UT-06-005 Phase 12 未タスク検出（GAP-02/03）                |
| 発見日       | 2026-03-17                                                  |
| GitHub Issue | #1291                                                       |

## 概要

UT-06-005 で実装済みの `processPermissionFallback` / `executeAbortFlow` / `executeSkipFlow` を実際の PreToolUse Hook フローに統合し、Permission 拒否・タイムアウト時のフォールバック動作を実行時に有効化する。

### 背景

UT-06-005 で3つのフォールバックメソッドを実装し、23テストで単体検証が完了したが、これらは PreToolUse Hook（`SkillExecutor.ts` L1127-1185）と接続されておらず、テストコードからのみ呼び出される状態にある。加えて、`sendPermissionRequest`（L1481-1517）のタイムアウト機構も未実装のままである。

### 目的

- PreToolUse Hook が Permission 拒否を受け取った際に `processPermissionFallback` を呼び出す
- `sendPermissionRequest` がタイムアウトした際に `executeAbortFlow("timeout")` が自動で呼び出される
- abort/skip/retry/timeout の全フォールバックパターンが実行時に正しく機能する

## スコープ

### 含むもの

- `SkillExecutor.ts` の PreToolUse Hook 内に `processPermissionFallback` 呼び出しを追加
- `sendPermissionRequest` にタイムアウト検知 + `executeAbortFlow("timeout")` 自動呼び出しを追加
- 新規メソッド: `handlePermissionCheck`, `sendPermissionRequestWithTimeout`
- 新規クラス: `PermissionTimeoutError`
- 統合テストファイル `SkillExecutor.hook-fallback.test.ts` の作成

### 含まないもの

- `processPermissionFallback` 本体の変更（UT-06-005 で実装済み）
- Permission UI の変更
- PermissionStore の変更

## 成果物

| 成果物タイプ | パス                                                                                 | 説明                 |
| ------------ | ------------------------------------------------------------------------------------ | -------------------- |
| コード       | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                              | PreToolUse Hook 修正 |
| テスト       | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts` | 統合テスト新規作成   |

## Phase 構成

| Phase | 名称             | 仕様書                         | 状態                        |
| ----- | ---------------- | ------------------------------ | --------------------------- |
| 1     | 要件定義         | `phase-1-requirements.md`      | 完了                        |
| 2     | 設計             | `phase-2-design.md`            | 完了                        |
| 3     | 設計レビュー     | `phase-3-design-review.md`     | 完了                        |
| 4     | テスト作成       | `phase-4-test-creation.md`     | 完了                        |
| 5     | 実装             | `phase-5-implementation.md`    | 完了                        |
| 6     | テスト拡充       | `phase-6-test-expansion.md`    | 完了                        |
| 7     | カバレッジ確認   | `phase-7-coverage-check.md`    | 完了                        |
| 8     | リファクタリング | `phase-8-refactoring.md`       | 完了                        |
| 9     | 品質保証         | `phase-9-quality-assurance.md` | 完了                        |
| 10    | 最終レビュー     | `phase-10-final-review.md`     | 完了                        |
| 11    | 手動テスト       | `phase-11-manual-test.md`      | 完了                        |
| 12    | ドキュメント     | `phase-12-documentation.md`    | 完了                        |
| 13    | PR作成           | `phase-13-pr-creation.md`      | BLOCKED（ユーザー承認待ち） |

## 依存関係

| タスクID    | 関係性                                            |
| ----------- | ------------------------------------------------- |
| UT-06-005   | 前提（processPermissionFallback 実装元）          |
| UT-06-005-B | 並列対象（revokeSessionEntries セッション別実装） |
| TASK-3-2    | 関連（PermissionResolver 実装）                   |
| TASK-3-1-B  | 関連（SkillExecutor IPC 統合）                    |

## 関連仕様書

| 仕様書                                                                                       | 内容                                |
| -------------------------------------------------------------------------------------------- | ----------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` | Permission フォールバックフロー詳細 |
| `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`              | fail-closed セキュリティ要件        |

## 関連 Pitfall

| Pitfall ID | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| P13        | タイマーテストの無限ループ（advanceTimersByTime を使用）      |
| P39        | happy-dom 環境での userEvent 非互換（fireEvent を使用）       |
| P40        | テスト実行ディレクトリ依存（pnpm --filter で実行）            |
| P54        | safeRegister パターン不適合（戻り値キャプチャ必要なハンドラ） |
| P60        | IPC テスト応答形式不一致（戻り値形式を先に確認）              |
| P61        | DIP 違反（インターフェース依存にする）                        |

## 完了条件

- [x] PreToolUse Hook の Permission 拒否分岐で `processPermissionFallback` が呼び出されること
- [x] `sendPermissionRequest` タイムアウト時に `executeAbortFlow("timeout")` が自動呼び出しされること
- [x] abort/skip/retry/timeout の全フォールバックパターンが実行時に機能すること
- [x] フォールバック処理の例外時に fail-closed（abort）が適用されること
- [x] 統合テスト `SkillExecutor.hook-fallback.test.ts` が全件パスすること（30 tests PASS）
- [x] 既存テスト（`SkillExecutor.*.test.ts`）が全件パスすること（`hooks.test.ts` / `performance.test.ts` PASS）
- [x] `pnpm --filter @repo/desktop typecheck` が通ること
- [x] lint 検証が通ること（`pnpm exec eslint apps/desktop/src/main/services/skill/...`）
- [x] Phase 12 完了時に LOGS.md（2ファイル）と SKILL.md（2ファイル）を更新すること
