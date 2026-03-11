# Phase 8: リファクタリング

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| タスクID   | TASK-UI-04B-WORKSPACE-CHAT |
| Phase      | 8                          |
| Phase名    | リファクタリング           |
| カテゴリ   | TDD-Refactor               |
| 優先度     | medium                     |
| ステータス | completed                  |
| 前提Phase  | Phase 7                    |
| 後続Phase  | Phase 9                    |

## 目的

重複した chat UI / hook ロジックを整理し、04B 専用責務と既存共有資産の境界を明確にする。

## 実行タスク

- UI 重複整理: button / chip / message row の責務を整える
- hook 整理: stream と conversation の side effect を controller に集約する
- 境界整理: 04A / 04B / workspace-chat-edit / 既存 ChatPanel の責務を見直す

## 参照資料

| 参照資料           | パス                                        | 説明           |
| ------------------ | ------------------------------------------- | -------------- |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`    | Phase 1 成果物 |
| コンポーネント設計 | `outputs/phase-2/component-design.md`       | Phase 2 成果物 |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`        | Phase 7 成果物 |
| ギャップ一覧       | `outputs/phase-7/coverage-gap-list.md`      | Phase 7 成果物 |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |
| 回帰マトリクス     | `outputs/phase-6/regression-matrix.md`      | Phase 6 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                         | 内容                    |
| ------------------- | ---------------------------------------------------------------------------- | ----------------------- |
| state management    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | hook / state 境界の正本 |
| directory structure | `.claude/skills/aiworkflow-requirements/references/directory-structure.md`   | ファイル配置境界の正本  |
| lessons             | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`       | 責務ドリフト再発防止    |

## 実行手順

### ステップ1: 重複箇所を抽出する

| 領域         | 重点観点                                   |
| ------------ | ------------------------------------------ |
| chat UI      | button / list / error UI の重複            |
| hook         | send / stream / persistence の責務混在     |
| file context | 04B と workspace-chat-edit の utility 重複 |

### ステップ2: 境界を再固定する

| 境界           | ルール                                          |
| -------------- | ----------------------------------------------- |
| 04A            | layout / resize / preview shell に限定する      |
| 04B            | chat interaction と conversation 接続に限定する |
| 04C            | preview / search interaction に限定する         |
| shared utility | context 生成と file list 抽出に限定する         |

## 統合テスト連携

| 観点           | 内容                                        |
| -------------- | ------------------------------------------- |
| shared utility | 共有化した関数の既存テストを維持する        |
| controller     | refactor 後も Phase 6 の integration を通す |
| boundary       | 04A / 04C 依存が増えていないことを確認する  |

## 多角的チェック観点

| 観点           | このPhaseでの確認内容                                  | 仕様参照先                                                                   |
| -------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| アーキテクチャ | shared utility と 04B 専用 code の境界を確認する       | `.claude/skills/aiworkflow-requirements/references/directory-structure.md`   |
| 状態管理       | controller と store 利用が過剰になっていないか確認する | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` |
| 改善思考       | 重複削減が可読性とテスト容易性を両立しているか確認する | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`       |

## 成果物

| 成果物           | パス                                    | 説明         |
| ---------------- | --------------------------------------- | ------------ |
| リファクタ記録   | `outputs/phase-8/refactoring-log.md`    | 実施内容     |
| 責務境界チェック | `outputs/phase-8/boundary-checklist.md` | 依存方向確認 |

## 完了条件

- [x] 重複箇所を抽出している
- [x] controller と UI の責務を整理している
- [x] 04A / 04B / 04C の境界を再確認している
- [x] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 重複抽出
2. 責務整理
3. shared utility 化判断
4. 回帰確認
5. 成果物と完了条件確認

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] `outputs/phase-8/` に作成すべき成果物を定義済み
- [x] `artifacts.json` へ登録すべき成果物を確認済み
- [x] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel` を再実行できる状態

## 次のPhase

[Phase 9: 品質保証](./phase-9-quality-assurance.md)
