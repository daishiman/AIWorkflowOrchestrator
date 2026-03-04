# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                                                  |
| ---------- | --------------------------------------------------- |
| Phase      | 12                                                  |
| 機能名     | task-050-ui-00-ui-design-foundation                 |
| タスクID   | TASK-UI-00-DESIGN-FOUNDATION                        |
| 作成日     | 2026-03-04                                          |
| 前提Phase  | Phase 11（手動テスト検証）                          |
| 後続Phase  | Phase 13（PR作成）                                  |
| 使用スキル | task-specification-creator, aiworkflow-requirements |

## 目的

実装内容・検証結果・学習事項を仕様へ同期し、再利用可能なドキュメント資産に変換する。特に、Phase 12必須5タスクを漏れなく完了できる実行仕様を固定する。

## 実行タスク

- Task 1: 実装ガイド作成（Part 1: 中学生レベル / Part 2: 技術者向け）
- Task 2: システム仕様更新（Step 1-A/1-B/1-C/1-D/1-E + Step 2条件付き）
- Task 3: ドキュメント更新履歴作成 + artifacts台帳更新
- Task 3.5: 実行証跡整合ガード（必須成果物5点の実在検証）
- Task 4: 未タスク検出レポート作成（0件でも必ず作成）
- Task 5: スキルフィードバックレポート作成（改善点なしでも必ず作成）

## 参照資料

| 資料名                   | パス                                                                                    | 説明                 |
| ------------------------ | --------------------------------------------------------------------------------------- | -------------------- |
| Phase 1成果物            | `outputs/phase-1/requirements-definition.md`                                            | 要件反映確認         |
| Phase 2成果物            | `outputs/phase-2/architecture-design.md`                                                | 設計反映確認         |
| Phase 5成果物            | `outputs/phase-5/implementation-summary.md`                                             | 実装反映確認         |
| Phase 6成果物            | `outputs/phase-6/test-expansion-report.md`                                              | 試験反映確認         |
| Phase 7成果物            | `outputs/phase-7/coverage-report.md`                                                    | 品質反映確認         |
| Phase 8成果物            | `outputs/phase-8/refactoring-report.md`                                                 | 改善反映確認         |
| Phase 9成果物            | `outputs/phase-9/quality-verification.md`                                               | QA反映確認           |
| Phase 10成果物           | `outputs/phase-10/final-review-result.md`                                               | ゲート結果反映       |
| Phase 11成果物           | `outputs/phase-11/manual-test-result.md`                                                | 実測結果             |
| 仕様更新ワークフロー     | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Task 2 実行基準      |
| Phase 11/12ガイド        | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`             | 必須タスク定義       |
| 技術文書ガイド           | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | Task 1 記述基準      |
| 実装履歴台帳             | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                    | 完了記録反映先       |
| 教訓台帳                 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                  | 苦戦箇所反映先       |
| UI仕様                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                 | UI正本更新先         |
| UI機能仕様               | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`         | 機能正本更新先       |
| UIアーキテクチャ         | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`               | 設計正本更新先       |
| 状態管理仕様             | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`            | P31関連同期先        |
| task-spec準拠監査        | `task-specification-creator-compliance-report.md`                                       | 準拠監査結果         |
| 抽出監査レポート         | `aiworkflow-requirements-extraction-report.md`                                          | 仕様抽出監査結果     |
| 総合整合監査             | `comprehensive-consistency-and-strategy-report.md`                                      | 整合性・戦略監査結果 |
| acceptance-criteria      | `outputs/phase-1/acceptance-criteria.md`                                                | Phase 1 成果物       |
| scope-definition         | `outputs/phase-1/scope-definition.md`                                                   | Phase 1 成果物       |
| integration-design-notes | `outputs/phase-2/integration-design-notes.md`                                           | Phase 2 成果物       |
| subagent-assignment      | `outputs/phase-2/subagent-assignment.md`                                                | Phase 2 成果物       |
| green-test-report        | `outputs/phase-5/green-test-report.md`                                                  | Phase 5 成果物       |
| implementation-mapping   | `outputs/phase-5/implementation-mapping.md`                                             | Phase 5 成果物       |
| regression-report        | `outputs/phase-8/regression-report.md`                                                  | Phase 8 成果物       |
| qa-risk-register         | `outputs/phase-9/qa-risk-register.md`                                                   | Phase 9 成果物       |
| remediation-directives   | `outputs/phase-10/remediation-directives.md`                                            | Phase 10 成果物      |
| discovered-issues        | `outputs/phase-11/discovered-issues.md`                                                 | Phase 11 成果物      |
| manual-test-checklist    | `outputs/phase-11/manual-test-checklist.md`                                             | Phase 11 成果物      |

## 実行手順

### ステップ1: Task 1（実装ガイド作成）

#### Part 1（中学生レベル、必須）

- 日常の例えを使う
- 専門用語は使わない（使う場合は即説明）
- 「なぜ必要か」→「何をするか」の順で説明する

#### Part 2（技術者向け、必須）

- 型定義とインターフェース
- APIシグネチャと使用例
- エラーハンドリングとエッジケース
- 設定可能なパラメータと定数

### ステップ2: Task 2（システム仕様更新）

#### Step 1-A（必須）

- 完了タスクセクション追加
- 関連ドキュメントリンク追加
- 変更履歴追記
- `aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md` の両方更新
- `aiworkflow-requirements/SKILL.md` と `task-specification-creator/SKILL.md` の両方更新
- `topic-map.md` 再生成

#### Step 1-B（必須）

- 実装状況テーブル更新（`未実装→完了` または `spec_created`）

#### Step 1-C（該当時必須）

- 関連タスク/未タスク候補テーブルを更新
- `grep -rn "TASK-UI-00-DESIGN-FOUNDATION" references/` で見落とし防止

#### Step 1-D（仕様書変更時は必須）

- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行し、topic-mapを再生成
- セクション追加・更新・削除・行数変更がある場合は必ず再生成する

#### Step 1-E（未タスク検出時は必須）

- 未タスク指示書作成後に `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行
- `task-workflow.md` 内の未タスクリンク参照切れを0件にする

#### Step 2（条件付き）

新規インターフェース・API契約・設定値の追加変更がある場合のみ、システム仕様を更新する。

| 判定     | 条件                                               |
| -------- | -------------------------------------------------- |
| 更新必要 | 新規/変更インターフェース、API契約変更、設定値追加 |
| 更新不要 | 内部実装のみ、リファクタのみ、仕様不変バグ修正     |

### ステップ3: Task 3/3.5（履歴作成 + 証跡整合）

- `documentation-changelog.md` を作成
- `spec-update-summary.md` に Task 1〜5 の実施結果を記録
- `artifacts.json` と `outputs/artifacts.json` の整合を確認
- 必須成果物5点（`implementation-guide.md`, `spec-update-summary.md`, `documentation-changelog.md`, `unassigned-task-detection.md`, `skill-feedback-report.md`）の実在を検証
- `artifacts.json` の `phases.12.status=completed` と `phase-12-documentation.md` 完了チェックの同期を確認
- 差分監査の合否は `audit-unassigned-tasks.js --json --diff-from HEAD` の `currentViolations.total` を基準に記録する

### ステップ4: Task 4（未タスク検出）

- スコープ外項目、レビュー指摘、手動試験発見事項、TODO/FIXME を調査
- 0件でも `unassigned-task-detection.md` を必ず出力する

### ステップ5: Task 5（スキルフィードバック）

- 今回の苦戦箇所
- 再発防止策
- 改善提案（改善なしの場合は「改善点なし」と明記）

## 成果物

| 成果物               | パス                                            | 説明                 |
| -------------------- | ----------------------------------------------- | -------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1 + Part 2      |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`       | Step 1-A〜Task 5結果 |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`   | 変更履歴             |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | 0件時も必須          |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | 改善提案/改善なし    |

## 完了条件

- [x] Task 1が2パート構成で作成されている
- [x] Task 2 Step 1-A/1-B/1-C/1-D/1-E/Step 2 の判定結果が記録されている
- [x] LOGS.md 2ファイル + SKILL.md 2ファイル + topic-map.md 再生成結果が記録されている
- [x] 必須成果物5点が実在する
- [x] `artifacts.json` / `outputs/artifacts.json` / `phase-12-documentation.md` チェックリストが同期している
- [x] 未タスク検出レポートが0件でも生成されている
- [x] スキルフィードバックレポートが生成されている
- [x] `verify-unassigned-links.js` 実行結果が記録されている
- [x] `audit-unassigned-tasks.js --json --diff-from HEAD` の `currentViolations.total` 判定が記録されている
- [x] 本Phase内の全タスクを100%実行完了

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                    | 仕様参照先                                                                   |
| ------------------ | --------------------------- | ---------------------------------------------------------------------------- |
| セキュリティ       | 仕様更新時の公開API境界確認 | `.claude/skills/aiworkflow-requirements/references/security-*.md`            |
| UI/UX              | UI基盤仕様の同期確認        | `.claude/skills/aiworkflow-requirements/references/ui-ux-*.md`               |
| アーキテクチャ     | 責務分離・構成整合の確認    | `.claude/skills/aiworkflow-requirements/references/architecture-*.md`        |
| API設計            | IPC/API契約差分確認         | `.claude/skills/aiworkflow-requirements/references/api-*.md`                 |
| データ整合性       | 台帳・リンク整合確認        | `.claude/skills/aiworkflow-requirements/references/database-*.md`            |
| エラーハンドリング | 失敗時レポートと再試行導線  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        |
| アクセシビリティ   | 手動検証結果の仕様反映確認  | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md` |

| 層                         | 適用判断              | 仕様参照先                                                                   |
| -------------------------- | --------------------- | ---------------------------------------------------------------------------- |
| フロントエンド（Renderer） | UI仕様更新時          | `.claude/skills/aiworkflow-requirements/references/ui-ux-*.md`               |
| バックエンド（Main）       | 実行系契約更新時      | `.claude/skills/aiworkflow-requirements/references/architecture-*.md`        |
| IPC通信                    | 契約差分がある場合    | `.claude/skills/aiworkflow-requirements/references/api-*.md`                 |
| Preload/セキュリティ       | 露出API差分がある場合 | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` |
| ローカルストレージ         | 台帳更新がある場合    | `.claude/skills/aiworkflow-requirements/references/database-*.md`            |

## サブタスク管理

1. Task 1（Part 1/Part 2）作成
2. Task 2 Step 1-A/1-B/1-C/1-D/1-E/Step 2 判定記録
3. Task 3/3.5（履歴・台帳・証跡整合）
4. Task 4（未タスク検出）
5. Task 5（スキルフィードバック）

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.json が更新されている
- [x] 必須成果物5点の実在を確認済み
- [x] `artifacts.json` の Phase 12 ステータスと完了チェックリストが同期済み

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/task-050-ui-00-ui-design-foundation

node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

## 次のPhase

Phase 13: PR作成
