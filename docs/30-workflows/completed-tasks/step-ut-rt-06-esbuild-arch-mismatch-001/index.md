# step-ut-rt-06-esbuild-arch-mismatch-001 - タスク実行仕様書

## ユーザーからの元の指示

```text
[UT-RT-06-ESBUILD-ARCH-MISMATCH-001] esbuild アーキテクチャ不整合の解消と再発防止手順整備
https://github.com/daishiman/AIWorkflowOrchestrator/issues/1710
```

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| タスクID     | UT-RT-06-ESBUILD-ARCH-MISMATCH-001               |
| タスク名     | esbuild-arch-mismatch-fix                        |
| 分類         | バグ修正（環境修正 + close-out 整流）            |
| 対象機能     | esbuild バイナリと Node 実行アーキテクチャの整合 |
| 優先度       | 高                                               |
| 見積もり規模 | 小規模                                           |
| ステータス   | 未実施                                           |
| 作成日       | 2026-03-29                                       |
| GitHub Issue | #1710                                            |

---

## タスク概要

### 目的

RT-06 の vitest 実行を阻害している esbuild / Node 実行アーキテクチャ不整合を解消し、再現条件と復旧手順を標準化する。

### 背景

Rosetta 経由の x64 Node と native arm64 Node が混在する worktree では、`pnpm install` 時の optional dependency 解決結果と実行時の `process.arch` がずれやすい。TASK-RT-06 ではこの環境 blocker により自動テスト判定が確定できず、Phase 10/11/12 で同一未タスクとして formalize された。

### 最終ゴール

- RT-06 対象テストが non-watch で 1 回完走する
- `process.arch` に対応する `@esbuild/darwin-*` が一致する
- worktree 再発防止手順が `docs/40-guides/` に残る
- 環境 blocker の扱いが Phase 10/11/12 で矛盾しない

### 成果物一覧

| 種別         | 成果物                | 配置先                                                   |
| ------------ | --------------------- | -------------------------------------------------------- |
| ドキュメント | 再発防止ガイド        | `docs/40-guides/esbuild-arch-mismatch-prevention.md`     |
| テスト結果   | RT-06 実行ログ        | `outputs/phase-5/test-result.md`                         |
| ドキュメント | 実装ガイド            | `outputs/phase-12/implementation-guide.md`               |
| ドキュメント | Phase 12 準拠チェック | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

---

## 参照ファイル

- `docs/30-workflows/unassigned-task/UT-RT-06-ESBUILD-ARCH-MISMATCH-001.md`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md`

---

## 多角的分析の一次結論

### 真の論点

主問題は `arm64` 固定ではなく、`実行中の Node` と `esbuild optional dependency` の一致が壊れていること。

### 依存関係と責務境界

- 環境修正は Phase 5 の責務
- blocker の条件付き判定は Phase 10/11/12 の責務
- 再発防止知識の永続化は Phase 12 の責務

### 価値とコスト

- 初回価値: RT-06 テストの復旧と再発防止
- 不要コスト: 全 desktop テストや PR 手順まで広げること

### 4条件評価

| 条件         | 一次評価                                                    |
| ------------ | ----------------------------------------------------------- |
| 矛盾なし     | `arm64 固定` を除去し current arch 基準へ統一すれば満たせる |
| 漏れなし     | Phase 11/12 の代替証跡と compliance check 追加が必要        |
| 整合性あり   | artifacts.json と各 Phase 成果物名を揃えれば満たせる        |
| 依存関係整合 | blocker は同一未タスク ID で追跡すれば満たせる              |

---

## タスク分解サマリー

| ID     | Phase    | サブタスク名     | 責務                                        | 依存 |
| ------ | -------- | ---------------- | ------------------------------------------- | ---- |
| T-01-1 | Phase 1  | 要件定義         | blocker 条件と受入基準の固定                | -    |
| T-02-1 | Phase 2  | 設計             | 診断・復旧・記録フローの設計                | T-01 |
| T-03-1 | Phase 3  | 設計レビュー     | 要件と設計の整合判定                        | T-02 |
| T-04-1 | Phase 4  | テスト計画       | Red/Green と blocker 再判定手順の定義       | T-03 |
| T-05-1 | Phase 5  | 実装             | 環境修正とガイド作成                        | T-04 |
| T-06-1 | Phase 6  | テスト拡充       | 周辺確認と冪等性確認                        | T-05 |
| T-07-1 | Phase 7  | カバレッジ確認   | target test の coverage または blocker 記録 | T-06 |
| T-08-1 | Phase 8  | リファクタリング | 手順の重複削減と文面統一                    | T-07 |
| T-09-1 | Phase 9  | 品質保証         | quality gate と current fact の照合         | T-08 |
| T-10-1 | Phase 10 | 最終レビュー     | 条件付き PASS / DEFERRED の判定             | T-09 |
| T-11-1 | Phase 11 | 手動テスト       | docs-only / NON_VISUAL の代替証跡           | T-10 |
| T-12-1 | Phase 12 | ドキュメント更新 | implementation guide と same-wave sync      | T-11 |
| T-13-1 | Phase 13 | PR 作成          | user approval がない限り blocked 記録のみ   | T-12 |

**総サブタスク数**: 13個

---

## 実行原則

- `arm64 固定` ではなく `EXPECTED_PLATFORM="darwin-$(node -p process.arch)"` を基準に判定する
- 環境 blocker が残る場合は PASS 偽装せず、同一未タスク ID で条件付き判定へ分離する
- docs-only / NON_VISUAL でも Phase 11 は `manual-test-result.md` と `discovered-issues.md` を残す
- Phase 12 は Part 1 / Part 2 と compliance check を省略しない
- commit / push / PR は本仕様書では blocked のまま扱う

---

## Phase一覧

| Phase | 名称               | 仕様書                                                       | ステータス |
| ----- | ------------------ | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義           | [phase-1-requirements.md](phase-1-requirements.md)           | 未実施     |
| 2     | 設計               | [phase-2-design.md](phase-2-design.md)                       | 未実施     |
| 3     | 設計レビューゲート | [phase-3-design-review.md](phase-3-design-review.md)         | 未実施     |
| 4     | テスト作成         | [phase-4-test-creation.md](phase-4-test-creation.md)         | 未実施     |
| 5     | 実装               | [phase-5-implementation.md](phase-5-implementation.md)       | 未実施     |
| 6     | テスト拡充         | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | 未実施     |
| 7     | カバレッジ確認     | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | 未実施     |
| 8     | リファクタリング   | [phase-8-refactoring.md](phase-8-refactoring.md)             | 未実施     |
| 9     | 品質保証           | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | 未実施     |
| 10    | 最終レビューゲート | [phase-10-final-review.md](phase-10-final-review.md)         | 未実施     |
| 11    | 手動テスト         | [phase-11-manual-test.md](phase-11-manual-test.md)           | 未実施     |
| 12    | ドキュメント更新   | [phase-12-documentation.md](phase-12-documentation.md)       | 未実施     |
| 13    | PR 作成            | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | 未実施     |

---

## Phase完了時の必須アクション

1. Phase 内タスクを完了条件まで実行する
2. 成果物名を `artifacts.json` と一致させる
3. blocker があれば PASS 偽装せず記録する
4. `artifacts.json` を更新する
5. Phase 末尾で 100% 実行完了を明記する

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/step-ut-rt-06-esbuild-arch-mismatch-001 --phase {{PHASE_NUMBER}}
```
