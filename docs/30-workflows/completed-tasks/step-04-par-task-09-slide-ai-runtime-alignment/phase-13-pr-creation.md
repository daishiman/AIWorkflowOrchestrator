# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 13                                                                                                                                                                                                                                    |
| Phase名    | PR作成                                                                                                                                                                                                                                |
| タスクID   | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001                                                                                                                                                                                               |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング）、Phase 9（品質検証）、Phase 10（最終レビュー）、Phase 11（手動テスト）、Phase 12（ドキュメント） |
| 後続Phase  | なし                                                                                                                                                                                                                                  |
| ステータス | not_started                                                                                                                                                                                                                           |
| 作成日     | 2026-03-13                                                                                                                                                                                                                            |
| 機能名     | slide-ai-runtime-alignment                                                                                                                                                                                                            |

## 目的

Slide / Modifier / Legacy Agent 経路の runtime 整流 の変更範囲と証跡を PR 用に整理する。

## user approval blocked ルール

- user の明示承認がない限り、commit / PR 作成は **blocked** とする
- ローカル確認（lint / typecheck / test）を省略しない
- commit / PR を自動で作らない
- user に確認を求め、承認後に実行する

## 実行タスク

- T-13-1 PR サマリドラフト作成: Summary / Test Plan / Breaking Changes を準備する
- T-13-2 Phase 12 までの完了根拠収集: 全 Phase の成果物と完了条件を集約する
- T-13-3 ローカル最終確認: lint / typecheck / test の最終結果を固定する
- T-13-4 user 承認取得: commit / PR 作成前に明示承認を得る

| T-ID   | 内容                        | 完了基準                                                  |
| ------ | --------------------------- | --------------------------------------------------------- |
| T-13-1 | PR サマリドラフト作成       | Summary + Test Plan + Breaking Changes が記述されている   |
| T-13-2 | Phase 12 までの完了根拠収集 | 全 Phase の成果物パスと完了条件の充足状況が記録されている |
| T-13-3 | ローカル最終確認            | lint + typecheck + test が全 PASS                         |
| T-13-4 | user 承認取得               | user が commit / PR 作成を明示的に承認している            |

## PR サマリドラフトテンプレート

```markdown
## Summary

- slide reverse-sync / modifier / legacy agent 経路を integrated runtime に整流する設計仕様書を作成
- Direct SDK / electron-store 直読み / Silent Fallback の排除を設計
- IPC チャネル名の正本統一 + validateIpcSender セキュリティ追加を設計
- Zustand slideSlice 新設（SyncStatus / SyncDirection / syncProgress）を設計
- UI 4 領域（SlideSyncCard / SlideProgressRow / SlideWatchStatus / SlideGuidanceBlock）を設計

## Test Plan

- [ ] Phase 9 品質検証: lint / typecheck / test 全 PASS
- [ ] Phase 10 最終レビュー: release blocker 0 件
- [ ] Phase 11 設計文書ウォークスルー: Blocker 0 件
- [ ] Phase 12 ドキュメント: 必須 6 タスク完了 + 必須成果物生成

## Breaking Changes

- agent-client.ts 廃止（Direct SDK / electron-store 直読み削除）
- IPC チャネル名変更（4 チャネル rename）
- modifier-skill.ts と skill-executor.ts の統合
```

## Phase 12 までの完了根拠セクション

| Phase    | 成果物パス          | 完了条件充足     |
| -------- | ------------------- | ---------------- |
| Phase 1  | `outputs/phase-1/`  | （実行時に記入） |
| Phase 2  | `outputs/phase-2/`  | （実行時に記入） |
| Phase 3  | `outputs/phase-3/`  | （実行時に記入） |
| Phase 4  | `outputs/phase-4/`  | （実行時に記入） |
| Phase 5  | `outputs/phase-5/`  | （実行時に記入） |
| Phase 6  | `outputs/phase-6/`  | （実行時に記入） |
| Phase 7  | `outputs/phase-7/`  | （実行時に記入） |
| Phase 8  | `outputs/phase-8/`  | （実行時に記入） |
| Phase 9  | `outputs/phase-9/`  | （実行時に記入） |
| Phase 10 | `outputs/phase-10/` | （実行時に記入） |
| Phase 11 | `outputs/phase-11/` | （実行時に記入） |
| Phase 12 | `outputs/phase-12/` | （実行時に記入） |

## 多角的チェック観点

| 観点         | チェック内容                                        | 関連ルール                  |
| ------------ | --------------------------------------------------- | --------------------------- |
| Git          | `--no-verify` を使用していないこと                  | CLAUDE.md Git操作の禁止事項 |
| Git          | main ブランチに直接 push していないこと             | 07-git-and-tooling.md       |
| PR           | タイトルが 70 文字以内であること                    | 07-git-and-tooling.md       |
| PR           | Summary（1-3 箇条書き）+ Test Plan を含むこと       | 07-git-and-tooling.md       |
| セキュリティ | credential / API key がコミットに含まれていないこと | 04-electron-security.md     |

## 参照資料

| 参照資料                    | パス                                                 | 内容                                                  |
| --------------------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                            | 依存する前提成果物を確認する                          |
| Phase 2（設計）             | `phase-2-design.md`                                  | 依存する前提成果物を確認する                          |
| Phase 5（実装）             | `phase-5-implementation.md`                          | 依存する前提成果物を確認する                          |
| Phase 6（テスト拡充）       | `phase-6-test-expansion.md`                          | 依存する前提成果物を確認する                          |
| Phase 7（カバレッジ確認）   | `phase-7-coverage-check.md`                          | 依存する前提成果物を確認する                          |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                             | 依存する前提成果物を確認する                          |
| Phase 9（品質検証）         | `phase-9-quality-assurance.md`                       | 依存する前提成果物を確認する                          |
| Phase 10（最終レビュー）    | `phase-10-final-review.md`                           | 依存する前提成果物を確認する                          |
| Phase 11（手動テスト）      | `phase-11-manual-test.md`                            | 依存する前提成果物を確認する                          |
| Phase 12（ドキュメント）    | `phase-12-documentation.md`                          | 依存する前提成果物を確認する                          |
| slide skill-executor        | `apps/desktop/src/main/slide/skill-executor.ts`      | slide skill execute の current path を確認する        |
| slide agent-client          | `apps/desktop/src/main/slide/agent-client.ts`        | legacy agent client の current path を確認する        |
| SlideWorkspace              | `apps/desktop/src/renderer/slide/SlideWorkspace.tsx` | slide renderer surface と reverse-sync 導線を確認する |

### システム仕様（aiworkflow-requirements）

> 完全な canonical set は `index.md` を正本とし、この Phase では「PR 説明に必要な根拠」だけを重点確認する。

| 参照資料                     | パス                                                                                            | 内容                                                      |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| workflow-ai-runtime-authmode | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | foundation 契約、canonical set、artifact inventory の正本 |
| task-workflow                | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                            | 完了台帳、関連タスク、未タスク反映の正本                  |
| lessons-learned              | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                          | 苦戦箇所と再発防止の正本                                  |
| legacy filename register     | `.claude/skills/aiworkflow-requirements/references/legacy-ordinal-family-register.md`           | artifact / output 名の旧名互換と PR 説明時の drift 監査   |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、対象範囲を固定する。

### ステップ2: T-13-1 PR サマリドラフトを作成する

テンプレートに基づき、Summary / Test Plan / Breaking Changes を記述する。

### ステップ3: T-13-2 Phase 12 までの完了根拠を収集する

全 Phase の成果物パスと完了条件の充足状況を完了根拠テーブルに記録する。

### ステップ4: T-13-3 ローカル最終確認を行う

`pnpm --filter @repo/desktop lint && pnpm --filter @repo/desktop typecheck && cd apps/desktop && pnpm vitest run` を実行する。

### ステップ5: T-13-4 user 承認を取得する

user に PR サマリドラフトと完了根拠を提示し、commit / PR 作成の承認を取得する。

### ステップ6: 承認後に commit / PR を作成する

user 承認後、`--no-verify` を使用せずに commit し、PR を作成する。

## サブタスク管理

1. T-13-1: PR サマリドラフト作成
2. T-13-2: Phase 12 までの完了根拠収集
3. T-13-3: ローカル最終確認（lint + typecheck + test）
4. T-13-4: user 承認取得
5. commit / PR 作成（user 承認後のみ）

## 成果物

| 成果物          | パス                                   | 内容                   |
| --------------- | -------------------------------------- | ---------------------- |
| PR サマリ下書き | `outputs/phase-13/pr-summary-draft.md` | 変更点と証跡をまとめる |

## 完了条件

- [ ] T-13-1: PR サマリドラフトが作成されている
- [ ] T-13-2: Phase 12 までの完了根拠が記録されている
- [ ] T-13-3: lint + typecheck + test が全 PASS
- [ ] T-13-4: user が commit / PR 作成を承認している
- [ ] PR 用の説明素材が揃っている

## タスク100%実行確認【必須】

- [ ] PR サマリドラフトに Summary + Test Plan + Breaking Changes が含まれている
- [ ] Phase 1 から Phase 12 までの全成果物パスが完了根拠テーブルに記録されている
- [ ] ローカル最終確認（lint + typecheck + test）の実行結果が記録されている
- [ ] `--no-verify` を使用していないこと
- [ ] main ブランチに直接 push していないこと
- [ ] user の明示承認が取得されていること
- [ ] credential / API key がコミットに含まれていないこと
- [ ] 成果物パスにファイルが存在する

## 次のPhase

- なし（仕様書作成完了）
