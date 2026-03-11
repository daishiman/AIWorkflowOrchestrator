# Phase 7: テストカバレッジ確認

## メタ情報

| 項目   | 値                                            |
| ------ | --------------------------------------------- |
| Phase  | 7                                             |
| 機能名 | task-058b-ui-04a-workspace-layout-filebrowser |
| 作成日 | 2026-03-10                                    |

## 目的

04A の component / hook / integration test が coverage 目標を満たしているかを確認し、未達の領域を Phase 6 へ戻せる状態にする。

## 実行タスク

- coverage 実行: task scope の vitest coverage を取得する
- 未達分析: file watcher、resize、keyboard nav の不足行を抽出する
- 戻り判断: 閾値未達なら Phase 6 へ戻す

## 参照資料

| 資料名     | パス                                                                              | 説明                 |
| ---------- | --------------------------------------------------------------------------------- | -------------------- |
| Phase 5    | `phase-5-implementation.md`                                                       | 実装対象             |
| Phase 6    | `phase-6-test-expansion.md`                                                       | 拡充ケース           |
| Phase 4    | `phase-4-test-creation.md`                                                        | 初期テスト           |
| テスト仕様 | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | coverage 文脈        |
| 品質要件   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | coverage gate の正本 |

## 実行手順

### ステップ1: 閾値

| 指標      | 目標                                                                 |
| --------- | -------------------------------------------------------------------- |
| Line      | 80% 以上                                                             |
| Branch    | 60% 以上                                                             |
| Function  | 80% 以上                                                             |
| 重要 hook | `useWorkspaceLayout`, `usePanelResize`, `useFileWatcher` で 85% 以上 |

### ステップ2: 未達時の戻り先

| 条件                 | 戻り先  |
| -------------------- | ------- |
| UI component の未達  | Phase 6 |
| hook の未達          | Phase 6 |
| design mismatch 起因 | Phase 2 |

## 統合テスト連携

| 観点       | 具体項目                                              |
| ---------- | ----------------------------------------------------- |
| Coverage   | component / hook / integration のいずれも対象に含める |
| Regression | 04B / 04C 境界の event を除外せず観測する             |
| Watcher    | P5 ガード分岐も branch に含める                       |

## 多角的チェック観点

| 観点     | このPhaseでの確認内容                                                         | 仕様参照先                                                                     |
| -------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 品質     | line / branch / function / critical hook の閾値が正本に一致するか確認する     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    |
| UI/UX    | 画面だけでなく keyboard nav と overlay 分岐も coverage 対象に含めるか確認する | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` |
| 状態管理 | selector 分岐、persist 復元、watcher guard 分岐の不足を抽出する               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   |
| 依存関係 | 未達時の戻り先が Phase 6 または Phase 2 と整合しているか確認する              | `phase-6-test-expansion.md`, `phase-2-design.md`                               |

## 成果物

| 成果物             | パス                                   | 説明     |
| ------------------ | -------------------------------------- | -------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`   | 数値結果 |
| ギャップ一覧       | `outputs/phase-7/coverage-gap-list.md` | 未達領域 |

## 完了条件

- [ ] coverage の閾値を固定している
- [ ] hook と component の重要領域を列挙している
- [ ] 未達時の戻り先を定義している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase 実行時は以下を SubTask として分離する。

1. coverage 実行
2. 未達分析
3. 戻り先判定
4. 成果物更新
5. 完了条件と validator の確認

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-7/` に作成すべき成果物を定義済み
- [ ] `artifacts.json` へ登録すべき成果物を確認済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser` を再実行できる状態

## 次のPhase

[Phase 8: リファクタリング](./phase-8-refactoring.md)
