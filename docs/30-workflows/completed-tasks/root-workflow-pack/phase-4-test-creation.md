# Phase 4: テスト作成

## 目的

root workflow と child task 仕様書に対する検証コマンド、観点、expected result を定義する。

## 実行タスク

- 文書構造検証コマンドの定義
- 依存順検証観点の定義
- 参照パス存在確認観点の定義

## 参照資料

| 資料名          | パス                                                                      | 説明     |
| --------------- | ------------------------------------------------------------------------- | -------- |
| create-workflow | `.agents/skills/task-specification-creator/references/create-workflow.md` | 検証基準 |
| phase-templates | `.agents/skills/task-specification-creator/references/phase-templates.md` | 共通構造 |

## 統合テスト連携

- `index.md` / `phase-*.md` / `artifacts.json` の存在
- child task `index.md + phase-1-13` の存在
- 参照切れ 0 件

## 成果物

| 成果物     | パス                       | 説明         |
| ---------- | -------------------------- | ------------ |
| テスト仕様 | `phase-4-test-creation.md` | 文書検証観点 |

## 完了条件

- [ ] root と child の検証観点が定義されている
- [ ] 実行順 / 構造 / リンクの観点が含まれている
- [ ] child task の 13 phase 完備を検証対象に含んでいる
- [ ] **本Phase内の全タスクを100%実行完了**
