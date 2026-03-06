# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 10                                    |
| 機能名     | task-043b-ui-ux-import-list-design    |
| タスク名   | TASK-10A-E-B UI/UX インポート一覧設計 |
| 前提Phase  | Phase 9                               |
| 後続Phase  | Phase 11                              |
| 作成日     | 2026-03-06                            |
| ステータス | completed                             |
| 担当       | SubAgent-B                            |

## 目的

要件、設計、テスト、品質監査が揃っており、`TASK-10A-E-D` と実装フェーズへ渡せる状態かを最終判定する。

## 背景

本フェーズは `phase-1-requirements.md`、`phase-2-design.md`、`phase-5-implementation.md` を基礎入力とし、`phase-9-quality-assurance.md` の監査結果を取り込んで go/no-go を決める。

## Atent Team 編成

| SubAgent | 関心ごと | 主担当内容                                  |
| -------- | -------- | ------------------------------------------- |
| B1       | 要件整合 | 要件と最終仕様の対応確認                    |
| B2       | 設計整合 | 2セクション、state、A11y、dialog の整合確認 |
| B3       | 品質整合 | test / coverage / A11y / UX gate の確認     |
| B4       | Go/No-Go | 最終判定と差戻し先決定                      |

## 実行タスク

- 要件レビュー: Phase 1 と Phase 2 の対応が残っているか確認する
- 依存レビュー: A / C / D タスクへ渡す前提が崩れていないか確認する
- 品質レビュー: Phase 7 / 9 の gate が揃っているか確認する
- 最終判定: Go / No-Go の条件を固定する

## 参照資料

### 依存Phase

| 資料名                             | パス                                                    | 用途           |
| ---------------------------------- | ------------------------------------------------------- | -------------- |
| 依存Phase 1 仕様                   | `phase-1-requirements.md`                               | 要件整合       |
| 依存Phase 2 仕様                   | `phase-2-design.md`                                     | 設計整合       |
| 依存Phase 5 仕様                   | `phase-5-implementation.md`                             | 実装境界       |
| 依存Phase 7 仕様                   | `phase-7-coverage-check.md`                             | gate 条件      |
| 依存Phase 9 仕様                   | `phase-9-quality-assurance.md`                          | 品質監査       |
| 依存Phase 7 成果物                 | `outputs/phase-7/coverage-gate-criteria.md`             | coverage gate  |
| 依存Phase 9 成果物                 | `outputs/phase-9/quality-report.md`                     | 総合監査       |
| 要件定義書                         | `outputs/phase-1/requirements-definition.md`            | Phase 1 成果物 |
| 受け入れ基準                       | `outputs/phase-1/acceptance-criteria.md`                | Phase 1 成果物 |
| スコープ定義                       | `outputs/phase-1/scope-definition.md`                   | Phase 1 成果物 |
| UI状態棚卸し                       | `outputs/phase-1/ui-state-inventory.md`                 | Phase 1 成果物 |
| 情報アーキテクチャ                 | `outputs/phase-2/information-architecture.md`           | Phase 2 成果物 |
| UI状態マトリクス                   | `outputs/phase-2/ui-state-matrix.md`                    | Phase 2 成果物 |
| A11y操作契約                       | `outputs/phase-2/a11y-interaction-contract.md`          | Phase 2 成果物 |
| 文言ガイド                         | `outputs/phase-2/copy-guidelines.md`                    | Phase 2 成果物 |
| 実装計画                           | `outputs/phase-5/implementation-plan.md`                | Phase 5 成果物 |
| コンポーネント境界図               | `outputs/phase-5/component-boundary-map.md`             | Phase 5 成果物 |
| selector-action対応表              | `outputs/phase-5/selector-action-map.md`                | Phase 5 成果物 |
| import flow wireframe              | `outputs/phase-5/import-flow-wireframe.md`              | Phase 5 成果物 |
| カバレッジ目標レポート             | `outputs/phase-7/coverage-target-report.md`             | Phase 7 成果物 |
| selector安定性チェックリスト       | `outputs/phase-7/selector-stability-checklist.md`       | Phase 7 成果物 |
| リファクタリング計画               | `outputs/phase-8/refactoring-plan.md`                   | Phase 8 成果物 |
| 文言トークン正規化                 | `outputs/phase-8/copy-token-normali                     |
| アクセシビリティ適合チェックリスト | `outputs/phase-9/accessibility-compliance-checklist.md` | Phase 9 成果物 |
| UX整合監査                         | `outputs/phase-9/ux-consistency-audit.md`               | Phase 9 成果物 |

zation.md`| Phase 8 成果物 |
| コンポーネント抽出ガイド |`outputs/phase-8/component-extraction-guideline.md` | Phase 8 成果物 |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                                            | 用途                             |
| -------------------- | ------------------------------------------------------------------------------- | -------------------------------- |
| UIコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`         | 完了済み UI パターンとの差分確認 |
| UI機能仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | 機能仕様の同期先確認             |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`     | 最終 gate 参照                   |
| タスク運用           | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`      | 差戻し条件                       |

## 実行手順

1. Phase 1 の FR / AC と Phase 2 の UI 設計の対応を表で確認する。
2. Phase 5 の実装境界に new IPC / new Store state が入っていないことを確認する。
3. Phase 7 と Phase 9 の gate 条件が blocking issue なしで揃っていることを確認する。
4. Go / No-Go と差戻し先を `final-review-result.md` へ記録する。

## 統合テスト連携

- Phase 10 の Go 判定は Phase 11 manual test の前提条件にする。
- No-Go 判定時は理由を Phase 5 / 6 / 7 / 9 のどこへ戻すかまで記録する。
- `TASK-10A-E-D` に渡す観点は未確定項目なしであることを条件にする。

## レビュー判定基準

| 判定     | 条件                                                                    | 対応                                               |
| -------- | ----------------------------------------------------------------------- | -------------------------------------------------- |
| PASS     | 要件、設計、テスト、coverage、QA、A11y、依存境界に欠陥がない            | Phase 11 へ進む                                    |
| MINOR    | 文言、証跡、補足説明、N/A理由に軽微な不足がある                         | 未タスク候補または補足記録を残して Phase 11 へ進む |
| MAJOR    | 実装境界逸脱、coverage 未達、focus/alert 契約欠落、A/C/D 依存衝突がある | 影響範囲に応じて Phase 5 / 6 / 7 / 9 へ差し戻す    |
| CRITICAL | 要件誤解、設計破綻、新規IPC混入、主要導線が成立しない                   | Phase 1 へ戻り、要件と設計を再確認する             |

### 差戻し先決定

| 問題種別             | 戻り先                 | 本タスクでの具体例                                         |
| -------------------- | ---------------------- | ---------------------------------------------------------- |
| 要件の問題           | Phase 1                | imported / available の対象範囲、非スコープ条件、AC が矛盾 |
| 設計の問題           | Phase 2                | 状態優先順位、focus return、件数表示、検索適用範囲が不整合 |
| テスト設計の問題     | Phase 4                | TC-ID、A11y ケース、dialog 経路が不足                      |
| 実装境界の問題       | Phase 5                | 新規IPC追加、Store state追加、既存 view 侵食               |
| 回帰/coverage の問題 | Phase 6 または Phase 7 | duplicate guard、error state、manual matrix が不足         |
| 品質監査の問題       | Phase 9                | warning-free 未達、A11y 監査未完了、UX整合欠落             |

## 多角的チェック観点

| 観点               | 本Phaseで確認する内容                                                                        | 仕様参照先                                                                                                                                                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | UI変更が Renderer 内に閉じており、新規IPC/Preload/API追加がないことを最終確認する            | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`, `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                                                      |
| UI/UX              | 2セクション、状態表示、文言、フォーカス、ライブリージョン、レスポンシブ品質を最終確認する    | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`      |
| アーキテクチャ     | `SkillManagementPanel` の責務境界と既存 view 非侵食が維持されているか確認する                | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                  |
| API/IPC            | `skill:list` / `skill:getImported` / `skill:import` の既存契約再利用に留まっているか確認する | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`, `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                                  |
| エラーハンドリング | error alert、retry、stale error クリア、擬似失敗防止を最終確認する                           | `.claude/skills/aiworkflow-requirements/references/error-handling.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                      |
| テスタビリティ     | TC-ID、selector、fixture、manual evidence の対応が最終レポートへ反映されるか確認する         | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`, `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`, `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md` |

### Electronデスクトップアプリ観点

| 層       | 本Phaseで確認する内容                                                  | 仕様参照先                                                                                                                                                      |
| -------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Renderer | list view / dialog / live region / focus contract の最終品質を確認する | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                                                         |
| Main     | 新規サービス追加なし、既存 handler 契約を変えない                      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |
| IPC通信  | 既存 `skill:*` channel の戻り値契約が維持されているか確認する          | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                                            |
| Preload  | 新規公開API追加なしを確認する                                          | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                                                                                    |
| Store    | `agentSlice` 個別selector と idempotent import 契約を維持する          | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                    |

## 成果物

| 成果物             | パス                                      | 説明                   |
| ------------------ | ----------------------------------------- | ---------------------- |
| 最終レビュー結果   | `outputs/phase-10/final-review-result.md` | Go / No-Go 判定        |
| Go/No-Go checklist | `outputs/phase-10/go-no-go-checklist.md`  | 通過条件一覧           |
| 依存レビュー       | `outputs/phase-10/dependency-review.md`   | A / C / D との依存整理 |

## 完了条件

- [x] 要件、設計、品質 gate の対応が確認されている
- [x] A / C / D との依存境界が確認されている
- [x] Go / No-Go の判定条件が定義されている
- [x] 差戻し先が明示されている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 要件整合確認
2. 依存整合確認
3. 品質整合確認
4. Go / No-Go 記録
5. 完了条件確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブルの全ファイルを出力
- [x] 完了条件を全件確認

## 次のPhase

Phase 11: 手動テスト検証
