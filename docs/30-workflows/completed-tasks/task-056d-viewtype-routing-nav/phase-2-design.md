# Phase 2: 設計

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| Phase        | 2                              |
| Phase名      | 設計                           |
| 前提Phase    | Phase 1                        |
| 後続Phase    | Phase 3                        |
| ステータス   | completed                      |
| 作成日       | 2026-03-05                     |
| 機能名       | task-056d-viewtype-routing-nav |
| 担当SubAgent | SubAgent-A                     |

## 目的

Phase 1要件をもとに、ViewType型、`renderView` 分岐、AppDockナビ、ショートカット契約、後続 `NAV_SECTIONS` 連携を設計書へ落とし込む。

## 実行タスク

- 型設計: `store/types.ts` の ViewType 拡張定義を設計する。
- ルーティング設計: `App.tsx` の `renderView` と `never` 網羅チェックを設計する。
- ナビ設計: AppDock navItems と `TASK-UI-02` `NAV_SECTIONS` の整合ルールを設計する。
- トレーサビリティ設計: 要件IDと設計要素の対応表を作成する。

## 参照資料

| 参照資料           | パス                                                                                        | 内容           |
| ------------------ | ------------------------------------------------------------------------------------------- | -------------- |
| Phase 1仕様        | `phase-1-requirements.md`                                                                   | 要件定義       |
| 要件成果物         | `outputs/phase-1/requirements-definition.md`                                                | FR/NFR詳細     |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`                                                    | 判定条件       |
| ナビ正本           | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | AppDock基準    |
| 状態管理正本       | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | ViewType責務   |
| 実装パターン正本   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 型網羅パターン |
| アーキテクチャ正本 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 層責務とSoC    |

## システム仕様（aiworkflow-requirements）

| 参照資料                     | パス                                                                                        | 内容                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------- |
| ナビゲーション               | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | 9項目メニュー契約                             |
| 状態管理                     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | ViewType拡張責務                              |
| 実装パターン                 | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | `Record` と網羅性担保                         |
| API設計（限定適用）          | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | IPC追加なしを確認するための参照               |
| IPC契約（限定適用）          | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | ViewType変更がIPC契約に影響しないことを確認   |
| インターフェース（限定適用） | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`              | UI型契約に影響しないことを確認                |
| インターフェース（限定適用） | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | skillCenter導線の型契約に影響しないことを確認 |
| データ整合性（非適用確認）   | `.claude/skills/aiworkflow-requirements/references/database-schema.md`                      | DB変更が不要であることを確認                  |
| エラーハンドリング           | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | 失敗結果の扱い                                |

## 実行手順

### ステップ1: 型設計

ViewType の追加値と禁止値を明確化し、単一の型定義に集約する。

### ステップ2: 分岐設計

`renderView` の全分岐を列挙し、`never` 到達検証を設計へ含める。

### ステップ3: ナビ設計

navItems と `NAV_SECTIONS` のマッピングを設計表として固定する。

### ステップ4: トレーサビリティ作成

要件IDから設計IDへの1対1対応表を作成する。

## 統合テスト連携

| 観点         | 内容                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| 統合ポイント | `store/types.ts` / `App.tsx` / `components/organisms/AppDock/index.tsx` |
| 契約検証     | ViewType値が設計表と一致することを検証対象に設定                        |
| 後続連携     | Phase 4のテストケースへ分岐設計を引き渡す                               |

## 成果物

| 成果物           | パス                                                 | 内容                      |
| ---------------- | ---------------------------------------------------- | ------------------------- |
| ViewType拡張設計 | `outputs/phase-2/viewtype-extension-design.md`       | 型設計                    |
| ルーティング設計 | `outputs/phase-2/routing-switch-design.md`           | 分岐設計                  |
| ナビ契約設計     | `outputs/phase-2/nav-contract-design.md`             | navItems/NAV_SECTIONS整合 |
| 正本仕様抽出表   | `outputs/phase-2/aiworkflow-requirements-extract.md` | 参照仕様抜粋              |
| トレーサビリティ | `outputs/phase-2/traceability-matrix.md`             | 要件設計対応              |

## 完了条件

- [x] ViewType型設計が単一定義で固定されている
- [x] `renderView` 全分岐と `never` 判定が設計に含まれている
- [x] navItems と `NAV_SECTIONS` の対応表が作成済み
- [x] 要件設計トレーサビリティが完成している
- [x] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 3: 設計レビューゲート

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                             | 仕様参照先                                   |
| ------------------ | ------------------------------------ | -------------------------------------------- |
| UI/UX              | ナビ設計を扱うため適用               | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | Viewと型境界を扱うため適用           | `aiworkflow-requirements: architecture-*.md` |
| API設計            | ショートカット契約連携を扱うため適用 | `aiworkflow-requirements: api-*.md`          |
| エラーハンドリング | 分岐漏れ時契約を扱うため適用         | `aiworkflow-requirements: error-handling.md` |

## サブタスク管理

1. 参照資料の確認
2. 型設計
3. 分岐設計
4. ナビ契約設計
5. トレーサビリティ作成

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物を指定パスに出力
- [x] 完了条件のチェックを更新
