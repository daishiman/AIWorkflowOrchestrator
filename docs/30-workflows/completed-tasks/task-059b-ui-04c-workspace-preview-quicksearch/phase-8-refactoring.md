# Phase 8: リファクタリング

## メタ情報

| 項目         | 値                                             |
| ------------ | ---------------------------------------------- |
| タスクID     | TASK-UI-04C-WORKSPACE-PREVIEW                  |
| 機能名       | task-059b-ui-04c-workspace-preview-quicksearch |
| Phase        | 8                                              |
| ステータス   | completed                                      |
| 作成日       | 2026-03-11                                     |
| 担当SubAgent | SubAgent-A / SubAgent-B                        |

## 目的

Green を維持したまま、PreviewPanel と QuickFileSearch の責務境界を整理し、再利用性と可読性を高める。04A との接続面を小さく保つ。

## 実行タスク

- コンポーネント分割: 表示ロジックとデータ取得ロジックを分離する
- hook整理: `useQuickFileSearch` の純粋関数部分を抽出する
- 型整理: preview 表示型と検索結果型を明示化する
- 命名整理: 04A/04B と衝突しない命名へ統一する
- 回帰確認: Phase 4-7 のテストが維持されることを確認する

## 参照資料

| 参照資料       | パス                                         | 説明               |
| -------------- | -------------------------------------------- | ------------------ |
| Phase 1 成果物 | `outputs/phase-1/requirements-definition.md` | 要件境界の維持確認 |
| Phase 2 成果物 | `outputs/phase-2/component-design.md`        | 設計境界の維持確認 |
| Phase 5        | `phase-5-implementation.md`                  | 実装計画           |
| Phase 6 成果物 | `outputs/phase-6/regression-matrix.md`       | 回帰観点の継承     |
| Phase 7        | `phase-7-coverage-check.md`                  | coverage 状況      |

### システム仕様（aiworkflow-requirements）

| 参照資料   | パス                                                                           | 本Phaseで使う理由  |
| ---------- | ------------------------------------------------------------------------------ | ------------------ |
| UI設計原則 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | Atomic Design 整理 |
| state管理  | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   | state 境界維持     |
| 品質要件   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | 回帰抑止           |

## 実行手順

### ステップ1: 責務分離候補を抽出

- preview renderer 分岐の純粋化候補
- search scoring の純粋化候補
- error mapping の共通化候補

### ステップ2: 分離後の境界を定義

| 境界          | ルール           |
| ------------- | ---------------- |
| UI components | 描画責務のみ     |
| hooks         | 状態遷移責務のみ |
| utils         | 純粋関数のみ     |

### ステップ3: 回帰確認

- 既存テストの成功を条件に分離を確定する
- coverage 低下を許容しない

## 統合テスト連携

| 観点         | Phase 9 へ引き継ぐ内容               |
| ------------ | ------------------------------------ |
| UI回帰       | mode 切替と preview 表示が維持される |
| IPC回帰      | read/watch 導線が維持される          |
| keyboard回帰 | Cmd+P と navigation 操作が維持される |

## 成果物

| 成果物         | パス                                     | 説明         |
| -------------- | ---------------------------------------- | ------------ |
| リファクタ計画 | `outputs/phase-8/refactoring-log.md`     | 分離方針     |
| 境界チェック   | `outputs/phase-8/boundary-checklist.md`  | 責務境界確認 |
| 型整理メモ     | `outputs/phase-8/type-refactor-notes.md` | 型整理方針   |

## 完了条件

- [ ] 分離対象を定義している
- [ ] 分離後の境界ルールを定義している
- [ ] 回帰確認方針を定義している
- [ ] 成果物パスを定義している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 分離候補抽出
2. 境界定義
3. 型整理
4. 回帰方針定義
5. 完了条件の自己検証

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-8/` に作成すべき成果物を定義済み
- [ ] `artifacts.json` へ登録すべき成果物を確認済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch` を再実行できる状態

## 次のPhase

[Phase 9: 品質保証](./phase-9-quality-assurance.md)
