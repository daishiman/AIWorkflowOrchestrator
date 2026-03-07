---
id: TASK-10A-E-C
tier: 3
title: TASK-10A-E Store駆動ライフサイクル統合設計
depends_on: [TASK-10A-E]
parallel_with: [TASK-10A-E-A, TASK-10A-E-B]
blocks: [TASK-10A-E-D]
status: spec_created
priority: high
estimated_complexity: small
tags: [docs, store, lifecycle, renderer]
---

# TASK-10A-E-C Store駆動ライフサイクル統合設計

## メタ情報

| 項目       | 値                                              |
| ---------- | ----------------------------------------------- |
| 担当       | SubAgent-C                                      |
| 対象       | SkillManagementPanel の state/selectors/actions |
| 実行モード | 仕様策定のみ（実装・コミット・PRなし）          |
| 方針       | 直接 IPC 呼び出し禁止、store action 経由に統一  |

## 目的

import 操作後に一覧が即時再計算される状態遷移を定義し、`TASK-10A-F` と衝突しない store 境界を設計する。

## 実行タスク

- selector設計: imported / available / filtered の算出責務を定義
- action設計: import 実行中フラグ、成功後再読込、失敗時エラー保持を定義
- 競合回避: `TASK-10A-F` の create/analyze 経路と責務重複しない境界を定義
- 再レンダー方針: 個別selector優先、P31無限ループ回避条件を定義

## 参照資料（aiworkflow-requirements）

| 参照資料        | パス                                                                                        | 使用目的                                |
| --------------- | ------------------------------------------------------------------------------------------- | --------------------------------------- |
| resource-map    | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | UI実装/状態管理/API設計の対象仕様を特定 |
| quick-reference | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                         | P31対策とResultパターンを先行固定       |
| 状態管理仕様    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | selector/action 分離と P31対策          |
| Skill API仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | store action の戻り値契約               |
| 実装パターン    | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | React + store の責務分離                |
| エラー仕様      | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | UI表示に渡すエラー分類                  |
| 品質要件        | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 状態遷移回帰を防ぐ品質ゲートを固定      |

## aiworkflow抽出トレーサビリティ

| 抽出ステップ | 根拠                            | 結果                                          |
| ------------ | ------------------------------- | --------------------------------------------- |
| タスク分類   | `indexes/resource-map.md`       | UI実装 + 状態管理設計として分類               |
| パターン固定 | `indexes/quick-reference.md`    | P31対策とstore selectorパターンを固定         |
| 正本抽出     | `arch-state-management.md` ほか | action/selector責務分離とエラー遷移方針を確定 |

## 実行手順

1. imported と available の算出ロジック責務を定義する。
2. import 実行時の `isImporting` と対象ID粒度の制御仕様を定義する。
3. 成功時は一覧再同期、失敗時はエラー状態保持の遷移を定義する。
4. hook依存配列と selector 分割の原則を明記して P31 再発を防止する。
5. D へ状態遷移テスト観点（成功/失敗/再試行/連打防止）を引き渡す。

## 成果物

| 成果物          | パス                                                                             | 説明                     |
| --------------- | -------------------------------------------------------------------------------- | ------------------------ |
| Store統合仕様書 | `../../../completed-tasks/task-043c-store-lifecycle-integration-design/index.md` | 状態遷移と責務境界の定義 |

## 完了条件

- [ ] selector/action の責務分離が定義されている
- [ ] import 成功/失敗時の状態遷移が定義されている
- [ ] `TASK-10A-F` との境界が定義されている
- [ ] P31対策を含む再レンダー方針が定義されている
