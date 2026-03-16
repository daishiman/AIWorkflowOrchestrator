# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 13                                     |
| Phase名    | PR作成                                 |
| 前提Phase  | Phase 12（ドキュメント）               |
| 後続Phase  | なし（最終Phase）                      |
| ステータス | blocked（ユーザー承認待ち）            |
| 作成日     | 2026-03-16                             |
| 機能名     | ライフサイクル履歴・フィードバック統合 |
| タスクID   | TASK-SKILL-LIFECYCLE-07                |
| タスク種別 | 設計（docs-only）                      |

---

## 目的

履歴/フィードバック差分とレビュー観点を PR に整理する。ユーザーの明示承認がない限り、PR は作成しない。

## 背景

Phase 1-12 の全成果物が揃った状態で、ユーザーの承認を得てから PR を作成する。設計タスク（docs-only）のため、コード変更はなく仕様書・設計書の差分のみが PR の内容となる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Phase 12 までの完了根拠確認

**目的**: Phase 1-12 の全成果物が揃っていることを確認する。

**実行手順**:

1. 以下の成果物ディレクトリが存在し、必要なファイルが含まれていることを確認する:
   - `outputs/phase-1/` : 5ファイル（lifecycle-event-catalog, feedback-collection-spec, task05-integration-contract, task08-metrics-definition, acceptance-criteria-matrix）
   - `outputs/phase-2/` : 5ファイル（event-model-design, aggregate-view-design, feedback-loop-design, publish-metrics-interface-design, data-flow-design）
   - `outputs/phase-3/` : 設計レビュー結果
   - `outputs/phase-4/` : テスト設計
   - `outputs/phase-5/` : 実装成果物
   - `outputs/phase-6/` : テスト拡充成果物
   - `outputs/phase-7/` : カバレッジ確認結果
   - `outputs/phase-8/` : リファクタリング成果物
   - `outputs/phase-9/` : 品質検証結果
   - `outputs/phase-10/` : 最終レビュー結果
   - `outputs/phase-11/` : 5ファイル（walkthrough-scenario-a/b/c, manual-test-report, discovered-issues）
   - `outputs/phase-12/` : 6ファイル（`outputs/phase-12/implementation-guide.md`, `outputs/phase-12/system-spec-update-summary.md`〔`outputs/phase-12/spec-update-summary.md` 互換名〕, `outputs/phase-12/documentation-changelog.md`, `outputs/phase-12/unassigned-task-detection.md`, `outputs/phase-12/skill-feedback-report.md`, `outputs/phase-12/phase12-task-spec-compliance-check.md`）

2. `artifacts.json` のステータスが全 Phase で `completed` であることを確認する

3. Phase 12 の検証コマンド結果がエラー0件であることを再確認する:

   ```bash
   # SKILL検証
   for skill in skill-creator task-specification-creator aiworkflow-requirements; do
     echo "=== $skill ===" && \
     node .claude/skills/skill-creator/scripts/quick_validate.js ".claude/skills/$skill"
   done

   # ワークフロー成果物検証
   node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
     docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback
   ```

4. `quick_validate.js` の Warning 分類（`許容 / 要監視 / 要対応`）が、以下2ファイルで同値に記録されていることを確認する:
   - `outputs/phase-12/system-spec-update-summary.md`
   - `outputs/phase-12/documentation-changelog.md`

**期待される成果物**:

- 完了根拠の確認結果（コンソール出力で検証）

---

### タスク2: PR準備チェックリスト

**目的**: PR 作成に必要な準備が整っていることを確認する。

**実行手順**:

1. ローカル確認チェックリスト:
   - [ ] `pnpm lint` が通ること（仕様書変更のみの場合はスキップ可）
   - [ ] `pnpm typecheck` が通ること（仕様書変更のみの場合はスキップ可）
   - [ ] `git status` で意図しないファイル変更がないこと
   - [ ] `git diff --stat origin/main...HEAD` で変更範囲が妥当であること

2. PR 内容の準備:
   - ブランチ名: `docs/task-skill-lifecycle-07-history-feedback`
   - PR タイトル: `docs(skill-lifecycle): TASK-07 履歴・フィードバック統合設計`（70文字以内）
   - PR 本文:
     - Summary（1-3箇条書き）:
       - ライフサイクルイベントモデル（5カテゴリ、16+イベント種別）の設計
       - フィードバック還流モデル（自動メトリクス + 手動評価）の設計
       - Task05/Task08 連携インターフェースの定義
     - Test Plan:
       - Phase 11 ウォークスルーシナリオ A/B/C 全 PASS
       - Phase 12 検証コマンド（quick_validate, verify-unassigned-links）全 PASS

3. コミットメッセージの準備:
   - `docs(skill-lifecycle): add lifecycle history and feedback integration design`

**期待される成果物**:

- PR準備チェックリストの確認結果

---

### タスク3: ユーザー承認待ち

**目的**: ユーザーの明示承認を得てから PR を作成する。

**実行手順**:

1. ユーザーに以下を報告する:
   - Phase 1-12 の全成果物が揃っていること
   - 検証コマンドがエラー0件であること
   - PR の内容（タイトル、Summary、変更範囲）
2. ユーザーの承認を待つ
3. 承認後、PR を作成する

> ルール: ユーザーの明示承認がない限り、commit / PR を自動で作成しない。

**ステータス**: blocked（ユーザー承認待ち）

---

## 参照資料

| 参照資料                     | パス                                                                             | 内容                   |
| ---------------------------- | -------------------------------------------------------------------------------- | ---------------------- |
| phase-template-phase13       | `.claude/skills/task-specification-creator/references/phase-template-phase13.md` | Phase 13 テンプレート  |
| review-gate-criteria         | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`   | レビューゲート基準     |
| Phase 2 成果物               | `outputs/phase-2/`                                                               | 設計成果物             |
| Phase 5 成果物               | `outputs/phase-5/`                                                               | 実装成果物             |
| Phase 6 成果物               | `outputs/phase-6/`                                                               | テスト拡充成果物       |
| Phase 7 成果物               | `outputs/phase-7/`                                                               | カバレッジ成果物       |
| Phase 8 成果物               | `outputs/phase-8/`                                                               | リファクタリング成果物 |
| Phase 9 成果物               | `outputs/phase-9/`                                                               | 品質検証成果物         |
| Phase 10 成果物              | `outputs/phase-10/`                                                              | 最終レビュー成果物     |
| Phase 11 成果物              | `outputs/phase-11/`                                                              | 手動テスト成果物       |
| Phase 12 成果物              | `outputs/phase-12/`                                                              | ドキュメント成果物     |
| 受入基準充足マトリクス       | `outputs/phase-10/acceptance-criteria-fulfillment.md`                            | Phase 10 成果物        |
| 設計-実装差分レポート        | `outputs/phase-10/design-implementation-gap-report.md`                           | Phase 10 成果物        |
| 連携最終検証レポート         | `outputs/phase-10/integration-final-verification.md`                             | Phase 10 成果物        |
| 最終レビュー判定書           | `outputs/phase-10/final-review-decision.md`                                      | Phase 10 成果物        |
| ウォークスルーシナリオA      | `outputs/phase-11/walkthrough-scenario-a.md`                                     | Phase 11 成果物        |
| ウォークスルーシナリオB      | `outputs/phase-11/walkthrough-scenario-b.md`                                     | Phase 11 成果物        |
| ウォークスルーシナリオC      | `outputs/phase-11/walkthrough-scenario-c.md`                                     | Phase 11 成果物        |
| 手動テスト結果レポート       | `outputs/phase-11/manual-test-report.md`                                         | Phase 11 成果物        |
| 発見事項リスト               | `outputs/phase-11/discovered-issues.md`                                          | Phase 11 成果物        |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`                                       | Phase 12 成果物        |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`                                 | Phase 12 成果物        |
| ドキュメント変更履歴         | `outputs/phase-12/documentation-changelog.md`                                    | Phase 12 成果物        |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`                                  | Phase 12 成果物        |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`                                      | Phase 12 成果物        |
| Phase12準拠チェック結果      | `outputs/phase-12/phase12-task-spec-compliance-check.md`                         | Phase 12 成果物        |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容                       |
| -------------------------- | --------------------------------------------------------------------------------- | -------------------------- |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | スキル管理インターフェース |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | 完了/未タスク台帳          |

---

## 成果物

Phase 13 はユーザー承認後に PR を作成するフェーズであり、事前に生成する成果物はない。

| 成果物       | パス   | 内容                 |
| ------------ | ------ | -------------------- |
| Pull Request | GitHub | ユーザー承認後に作成 |

---

## 統合テスト連携

- Phase 12 の全成果物と検証結果が PR の根拠となる
- PR マージ後、後続タスク TASK-SKILL-LIFECYCLE-08（公開・互換性）が本タスクの成果物を参照する

---

## 完了条件

- [ ] Phase 1-12 の全成果物が存在し、artifacts.json が全 Phase completed であること
- [ ] 検証コマンド（quick_validate, verify-unassigned-links, validate-phase-output）がエラー0件であること
- [ ] `quick_validate.js` Warning 分類（許容 / 要監視 / 要対応）が Phase 12 成果物2ファイルで一致していること
- [ ] ユーザーの明示承認を得ていること
- [ ] PR が作成され、Summary と Test Plan が記載されていること
- [ ] `--no-verify` を使用していないこと

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 12（ドキュメント）が完了していること
- **後続**: なし（最終Phase）。PR マージ後、TASK-SKILL-LIFECYCLE-08 が開始可能になる

---

## 次のPhase

Phase 13 が最終Phaseです。PR マージ後、以下の後続タスクが開始可能になります:

`docs/30-workflows/skill-lifecycle-unification/tasks/step-06-seq-task-08-skill-publishing-version-compatibility/`
