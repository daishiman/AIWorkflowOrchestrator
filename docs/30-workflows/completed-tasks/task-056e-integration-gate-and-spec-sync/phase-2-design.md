# Phase 2: 設計

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| Phase        | 2                                        |
| Phase名      | 設計                                     |
| 前提Phase    | Phase 1                                  |
| 後続Phase    | Phase 3                                  |
| ステータス   | completed                                |
| 作成日       | 2026-03-06                               |
| 機能名       | task-056e-integration-gate-and-spec-sync |
| 担当SubAgent | SubAgent-E1 / E2 / E3                    |

## 目的

統合レビューゲート、仕様同期台帳、後続タスク引き渡し計画を実行可能な設計へ落とし込む。

## 実行タスク

- ゲート設計: 判定軸、証跡ソース、戻り先Phaseを含むレビューゲートを設計する。
- 同期台帳設計: aiworkflow 反映対象を常時更新、条件付き更新、更新不要の3区分で整理する。
- 引き渡し設計: 後続UIタスクへ渡す参照リンク、前提成果物、解除条件を設計する。

## 参照資料

| 参照資料                        | パス                                                                                                    | 内容                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Phase 1要件                     | `phase-1-requirements.md`                                                                               | 要件入力                        |
| 親エントリ仕様                  | `docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/index.md`                   | タスク境界                      |
| C正本                           | `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/index.md`                      | notification / history 設計入力 |
| D正本                           | `docs/30-workflows/completed-tasks/task-056d-viewtype-routing-nav/index.md`                             | view / nav 設計入力             |
| A正本                           | `docs/30-workflows/completed-tasks/task-056a-a-store-slice-baseline/index.md`                           | state境界入力                   |
| B正本                           | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-056a-b-ipc-contract-security.md` | IPC / security 入力             |
| aiworkflow リソースマップ       | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                        | 読み込む正本の選定              |
| aiworkflow クイックリファレンス | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                                     | 主要パターンの早見表            |
| aiworkflow トピックマップ       | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                                           | セクション位置の特定            |
| 要件定義書                      | `outputs/phase-1/requirements-definition.md`                                                            | Phase 1 成果物                  |
| 受け入れ基準                    | `outputs/phase-1/acceptance-criteria.md`                                                                | Phase 1 成果物                  |
| スコープ定義                    | `outputs/phase-1/scope-definition.md`                                                                   | Phase 1 成果物                  |

## システム仕様（aiworkflow-requirements）

| 参照資料                             | パス                                                                                        | 内容                                             |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| アーキテクチャ総論                   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 層責務と依存方向                                 |
| 実装パターン                         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | safeInvoke / safeOn とレビューゲートの再利用基準 |
| 状態管理パターン                     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | state同期判断                                    |
| APIエンドポイント                    | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | IPCカテゴリと実装状況表                          |
| IPC仕様                              | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | notification / history チャネルの確認            |
| Preloadセキュリティ                  | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | 公開境界とホワイトリスト                         |
| IPCセキュリティ                      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | sender順序の確認                                 |
| エラーハンドリング                   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | FAIL理由と Result 契約                           |
| 履歴データ型                         | `.claude/skills/aiworkflow-requirements/references/ui-history-data-types.md`                | history DTO と戻り値構造                         |
| 履歴統合                             | `.claude/skills/aiworkflow-requirements/references/ui-history-integration.md`               | history 導線と統合観点                           |
| ナビゲーションUI                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | ViewType / AppDock の正本                        |
| UIインターフェース（限定適用）       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`              | 下流UI契約への影響確認                           |
| Skill UIインターフェース（限定適用） | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | SkillCenter導線への影響確認                      |
| 品質要件                             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | テスト戦略と判定閾値                             |
| タスク台帳                           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 台帳更新設計                                     |
| 教訓集                               | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 056系の再発防止策                                |

## 実行手順

### ステップ1: aiworkflow 抽出対象の固定

`resource-map.md` と `quick-reference.md` で読み込む正本を選定し、`topic-map.md` で対象セクションを特定して `aiworkflow-requirements-extract.md` に転記する。抽出結果は `必須 / 条件付き / 非適用` の3区分で整理し、A/B/C/D のどの成果物から必要性が導かれたかを明記する。

### ステップ2: 統合レビューゲート設計

判定軸、証跡、責務分離、戻り先Phaseを `integration-gate-design.md` に定義する。

### ステップ3: 仕様同期台帳設計

更新対象ファイル、更新理由、Step 1-B / Step 1-C / Step 2 の区分を `spec-sync-matrix.md` に整理する。

### ステップ4: 引き渡し計画設計

下流タスクごとに参照リンク、前提条件、ブロッカー解除条件を `dependency-handoff-plan.md` に定義する。

## 統合テスト連携

| 観点     | 内容                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| 要件追跡 | Phase 1 の要件IDを各設計成果物へ対応付ける                                     |
| 上流整合 | C/D/A/B の成果物から設計へ転記した項目をトレース表で確認する                   |
| 下流整合 | `TASK-UI-02` / `TASK-UI-03` / `TASK-UI-04A` の依存項目を引き渡し計画へ反映する |

## 成果物

| 成果物             | パス                                                 | 内容                                      |
| ------------------ | ---------------------------------------------------- | ----------------------------------------- |
| 統合ゲート設計     | `outputs/phase-2/integration-gate-design.md`         | 判定軸、証跡、戻り先                      |
| 仕様同期マトリクス | `outputs/phase-2/spec-sync-matrix.md`                | aiworkflow更新対象一覧                    |
| 引き渡し計画       | `outputs/phase-2/dependency-handoff-plan.md`         | 下流タスクの解除条件                      |
| 要件抽出レポート   | `outputs/phase-2/aiworkflow-requirements-extract.md` | 必須 / 条件付き / 非適用 の抽出結果と根拠 |
| トレーサビリティ表 | `outputs/phase-2/traceability-matrix.md`             | 要件・設計・正本の対応                    |

## 完了条件

- [x] 統合レビューゲートの判定軸が5分類で定義されている
- [x] 仕様同期対象が常時更新、条件付き更新、更新不要に分類されている
- [x] 下流タスクごとのブロッカー解除条件が定義されている
- [x] aiworkflow 正本が必須 / 条件付き / 非適用の3区分で整理されている
- [x] 参照した aiworkflow 正本の更新判断根拠が記録されている
- [x] Phase 1 の要件IDと設計成果物の対応が記録されている

## 次のPhase

Phase 3: 設計レビューゲート

## 多角的チェック観点（AIが判断）

| 観点                         | 適用判断                                            | 仕様参照先                                                                                              |
| ---------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| アーキテクチャ               | 依存方向と責務分離を設計するため適用                | `aiworkflow-requirements: architecture-overview.md`                                                     |
| 状態管理                     | state 同期対象を設計するため適用                    | `aiworkflow-requirements: arch-state-management.md`                                                     |
| IPC / Preload / セキュリティ | ipc / security 同期対象と公開境界を設計するため適用 | `aiworkflow-requirements: api-ipc-system.md`, `security-api-electron.md`, `security-electron-ipc.md`    |
| UI / 履歴 / ナビゲーション   | history / navigation 同期対象を設計するため適用     | `aiworkflow-requirements: ui-history-data-types.md`, `ui-history-integration.md`, `ui-ux-navigation.md` |
| エラーハンドリング           | FAIL理由と戻り値契約を設計するため適用              | `aiworkflow-requirements: error-handling.md`                                                            |
| ドキュメント整合             | task-workflow / lessons 反映対象を設計するため適用  | `aiworkflow-requirements: task-workflow.md`, `lessons-learned.md`                                       |

## サブタスク管理

Phase実行開始時に、TodoWriteツールまたは同等のタスク管理手段で以下のサブタスクを作成し、完了後ただちに `completed` へ更新する。

1. aiworkflow 抽出対象の固定
2. 統合レビューゲート設計
3. 仕様同期台帳設計
4. 引き渡し計画設計
5. 完了条件の検証

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] aiworkflow 抽出結果を成果物へ反映
- [x] 判定軸、同期台帳、引き渡し計画を成果物へ反映
- [x] `artifacts.json` の対象Phaseステータス更新内容を確認

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync \
  --phase 2
```
