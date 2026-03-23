# UT-EXECUTION-ENV-TERMINAL-001: ExecutionEnvironment.terminal 本実装 + assertNoSilentFallback

## メタ情報

| 項目       | 値                                                         |
| ---------- | ---------------------------------------------------------- |
| タスクID   | UT-EXECUTION-ENV-TERMINAL-001                              |
| Issue      | #1456                                                      |
| 由来       | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 P62 対策 |
| ステータス | unassigned                                                 |
| 優先度     | high（P62 対策）                                           |
| 作成日     | 2026-03-23                                                 |

## 概要

`ExecutionEnvironment.terminal` の placeholder 実装を本実装に移行し、`assertNoSilentFallback` ガードにより `DEFAULT_CONFIG` への暗黙 fallback が発生しないことを保証する。

## 3 つの Concern

| Concern | 名称                          | 所有層   | 責務                                                |
| ------- | ----------------------------- | -------- | --------------------------------------------------- |
| C-1     | Terminal 環境本実装           | Renderer | placeholder → `TerminalHandoffCard` 表示への移行    |
| C-2     | assertNoSilentFallback ガード | Main     | LLM 呼び出し前の Provider/Model 未選択検出          |
| C-3     | 未選択時エラー表示            | Renderer | ユーザーへのエラーフィードバック + 設定画面遷移 CTA |

## 受入基準

- [ ] AC-1: `ExecutionEnvironment.terminal` が `TerminalHandoffCard` を使った本実装になっている
- [ ] AC-2: `HandoffGuidance` が `null` の場合に適切な空状態が表示される
- [ ] AC-3: `assertNoSilentFallback()` 関数が実装されている
- [ ] AC-4: `getSelectedLLMConfig()` が `null` を返す状態で LLM 呼び出しを行うとエラーが throw される
- [ ] AC-5: Provider/Model 未選択時にユーザーへエラーメッセージが表示される
- [ ] AC-6: unit test でガード動作（fallback が発生しないこと）が検証されている
- [ ] AC-7: `interfaces-agent-sdk-skill-reference-share-debug-analytics.md` に terminal の `assertNoSilentFallback` 仕様が追記されている

## Phase 一覧

| Phase | 名称             | 仕様書                                                       | ステータス |
| ----- | ---------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](phase-1-requirements.md)           | 完了       |
| 2     | 設計             | [phase-2-design.md](phase-2-design.md)                       | 完了       |
| 3     | 設計レビュー     | [phase-3-design-review.md](phase-3-design-review.md)         | 完了       |
| 4     | テスト作成       | [phase-4-test-creation.md](phase-4-test-creation.md)         | 完了       |
| 5     | 実装             | [phase-5-implementation.md](phase-5-implementation.md)       | 完了       |
| 6     | テスト拡充       | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | 完了       |
| 7     | カバレッジ確認   | [phase-7-coverage.md](phase-7-coverage.md)                   | 完了       |
| 8     | リファクタリング | [phase-8-refactoring.md](phase-8-refactoring.md)             | 完了       |
| 9     | 品質保証         | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | 完了       |
| 10    | 最終レビュー     | [phase-10-final-review.md](phase-10-final-review.md)         | 完了       |
| 11    | 手動テスト       | [phase-11-manual-test.md](phase-11-manual-test.md)           | 完了       |
| 12    | ドキュメント     | [phase-12-documentation.md](phase-12-documentation.md)       | 完了       |
| 13    | PR作成           | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | 未着手     |

## 変更ファイル

### 変更

| ファイル                                                       | 変更内容                                  |
| -------------------------------------------------------------- | ----------------------------------------- |
| `apps/desktop/src/main/ipc/llmConfigProvider.ts`               | `assertNoSilentFallback()` + エラー型追加 |
| `apps/desktop/src/renderer/.../ExecutionEnvironment/index.tsx` | terminal placeholder → 本実装             |

### 新規（テスト）

| ファイル                                                                         | 内容                            |
| -------------------------------------------------------------------------------- | ------------------------------- |
| `apps/desktop/src/main/ipc/__tests__/assertNoSilentFallback.test.ts`             | ガード unit test（10 ケース）   |
| `apps/desktop/src/renderer/.../ExecutionEnvironment/__tests__/terminal.test.tsx` | terminal 表示テスト（8 ケース） |

## 関連仕様書

| 仕様書                                | パス                                                                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Terminal Handoff Surface 設計サマリー | `docs/30-workflows/completed-tasks/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-2/design-summary.md` |
| Agent SDK Skill 仕様 reference bundle | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md`              |
