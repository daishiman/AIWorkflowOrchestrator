# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 8                                     |
| 機能名     | task-043b-ui-ux-import-list-design    |
| タスク名   | TASK-10A-E-B UI/UX インポート一覧設計 |
| 前提Phase  | Phase 7                               |
| 後続Phase  | Phase 9                               |
| 作成日     | 2026-03-06                            |
| ステータス | completed                             |
| 担当       | SubAgent-B                            |

## 目的

実装後に `SkillManagementPanel` list branch が肥大化した場合でも、安全にセクション分割、文言正規化、fixture 整理を実施できるルールを定義する。

## 背景

Phase 8 は `phase-1-requirements.md`、`phase-2-design.md`、`phase-5-implementation.md`、`phase-6-test-expansion.md`、`phase-7-coverage-check.md` を入力にし、UI設計と品質ゲートを保ったまま保守性を上げる役割を持つ。

## Atent Team 編成

| SubAgent | 関心ごと     | 主担当内容                                   |
| -------- | ------------ | -------------------------------------------- |
| B1       | 分割基準     | section component 抽出条件                   |
| B2       | 文言統一     | CTA、見出し、状態文言の token 化             |
| B3       | fixture 整理 | 単体 / 統合テストの共通 factory 化           |
| B4       | 回帰維持     | Phase 6 / 7 の gate を保ったまま整理する条件 |

## 実行タスク

- 分割基準定義: `SkillManagementPanel` list branch を section component へ分割する条件を定義する
- 文言正規化: imported / available / CTA / result copy を再利用可能な token へ寄せる条件を定義する
- fixture 正規化: repeated mock state を helper へ抽出する条件を定義する
- 回帰維持: Phase 6 / 7 の回帰マトリクスを守る条件を定義する

## 参照資料

### 依存Phase

| 資料名                       | パス                                              | 用途             |
| ---------------------------- | ------------------------------------------------- | ---------------- |
| 依存Phase 1 仕様             | `phase-1-requirements.md`                         | 要件再確認       |
| 依存Phase 2 仕様             | `phase-2-design.md`                               | UI設計再確認     |
| 依存Phase 5 仕様             | `phase-5-implementation.md`                       | 実装境界再確認   |
| 依存Phase 6 仕様             | `phase-6-test-expansion.md`                       | 回帰ケース再確認 |
| 依存Phase 7 仕様             | `phase-7-coverage-check.md`                       | gate 条件再確認  |
| 依存Phase 6 成果物           | `outputs/phase-6/regression-matrix.md`            | 回帰条件         |
| 依存Phase 7 成果物           | `outputs/phase-7/coverage-gate-criteria.md`       | fail 条件        |
| 実装計画                     | `outputs/phase-5/implementation-plan.md`          | Phase 5 成果物   |
| コンポーネント境界図         | `outputs/phase-5/component-boundary-map.md`       | Phase 5 成果物   |
| selector-action対応表        | `outputs/phase-5/selector-action-map.md`          | Phase 5 成果物   |
| import flow wireframe        | `outputs/phase-5/import-flow-wireframe.md`        | Phase 5 成果物   |
| カバレッジ目標レポート       | `outputs/phase-7/coverage-target-report.md`       | Phase 7 成果物   |
| selector安定性チェックリスト | `outputs/phase-7/selector-stability-checklist.md` | Phase 7 成果物   |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                                           | 用途                     |
| -------------------- | ------------------------------------------------------------------------------ | ------------------------ |
| UIアーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`      | component 境界基準       |
| UI設計原則           | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | 文言と操作継続性         |
| UIコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`        | empty/loading/error 表現 |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | refactor 後の gate 維持  |

## 実行手順

1. list branch の責務を `toolbar`、`imported section`、`available section`、`status region` に分解し、抽出条件を定義する。
2. 文言は token 化対象と inline 文言を切り分け、見出しと CTA の揺れを禁止する。
3. mock state は imported / available / error / loading の4パターンに集約する。
4. refactor 後も Phase 6 regression matrix と Phase 7 gate criteria を満たす前提で手順を定義する。

## 統合テスト連携

- 抽出後の subcomponent でも list view 全体の integration test を維持する。
- fixture 抽出は assertion の意味を変えない範囲に限定する。
- coverage gate 未達なら Phase 5 へ戻す。

## 多角的チェック観点

| 観点               | 本Phaseで確認する内容                                                                  | 仕様参照先                                                                                                                                                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | リファクタリングで新規IPC/Preload/API追加を発生させない                                | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`, `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                                                      |
| UI/UX              | 2セクション、状態表示、文言、フォーカス、ライブリージョンを変えずに責務だけ整理する    | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`      |
| アーキテクチャ     | `SkillManagementPanel` の責務境界と既存 `editor/analysis/create` view 非侵食を強化する | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                  |
| API/IPC            | `skill:list` / `skill:getImported` / `skill:import` の既存契約再利用に限定する         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`, `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                                  |
| エラーハンドリング | 擬似失敗、二重追加、stale error、再試行導線を壊さない                                  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                      |
| テスタビリティ     | TC-ID、selector、fixture、manual evidence の対応が refactor 後も維持される             | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`, `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`, `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md` |

### Electronデスクトップアプリ観点

| 層       | 本Phaseで確認する内容                                                | 仕様参照先                                                                                                                                                      |
| -------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Renderer | list view / dialog / live region / focus contract を変えずに整理する | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                                                         |
| Main     | 新規サービス追加なし、既存 handler 契約を変えない                    | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |
| IPC通信  | 既存 `skill:*` channel を再利用し、新規 channel を追加しない         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                                            |
| Preload  | 新規公開API追加なしを確認する                                        | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                                                                                    |
| Store    | `agentSlice` 個別selector と idempotent import 契約を維持する        | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                    |

## 成果物

| 成果物               | パス                                                | 説明                     |
| -------------------- | --------------------------------------------------- | ------------------------ |
| リファクタリング計画 | `outputs/phase-8/refactoring-plan.md`               | 分割順序と rollback 単位 |
| 文言正規化ルール     | `outputs/phase-8/copy-token-normalization.md`       | 見出しと CTA の統一方針  |
| component 抽出指針   | `outputs/phase-8/component-extraction-guideline.md` | section 分割条件         |

## 完了条件

- [x] 分割基準が数値または条件で定義されている
- [x] 文言正規化対象が定義されている
- [x] fixture 整理方針が定義されている
- [x] gate fail 時の差戻し先が定義されている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 分割基準作成
2. 文言正規化作成
3. fixture 整理方針作成
4. 回帰維持条件作成
5. 完了条件確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブルの全ファイルを出力
- [x] 完了条件を全件確認

## 次のPhase

Phase 9: 品質保証
