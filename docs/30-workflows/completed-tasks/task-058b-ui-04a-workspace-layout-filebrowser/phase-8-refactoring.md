# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                            |
| ------ | --------------------------------------------- |
| Phase  | 8                                             |
| 機能名 | task-058b-ui-04a-workspace-layout-filebrowser |
| 作成日 | 2026-03-10                                    |

## 目的

Green を維持したまま、重複ロジック、責務の混在、hook 境界の肥大化を整理する。

## 実行タスク

- レイアウト責務整理: view と hook の責務を整理する
- tree 処理整理: node 描画と keyboard nav の責務を分ける
- watcher 整理: cleanup と debounce の責務を分ける
- style 整理: panel と zero state の class 組み立てを整理する

## 参照資料

| 資料名  | パス                        | 説明          |
| ------- | --------------------------- | ------------- |
| Phase 1 | `phase-1-requirements.md`   | 元要件        |
| Phase 2 | `phase-2-design.md`         | 目標設計      |
| Phase 5 | `phase-5-implementation.md` | 実装結果      |
| Phase 6 | `phase-6-test-expansion.md` | 回帰ケース    |
| Phase 7 | `phase-7-coverage-check.md` | coverage 結果 |

## 実行手順

### ステップ1: 重複ロジック抽出

- mode 計算と persist を `useWorkspaceLayout` に寄せる
- width clamp を `usePanelResize` に寄せる
- watch start / stop と debounce を `useFileWatcher` に寄せる

### ステップ2: UI 分離

- presentational component は selector を持たない
- container 側だけが store selector と IPC を扱う

## 統合テスト連携

| 観点               | 具体項目                                           |
| ------------------ | -------------------------------------------------- |
| Refactor safety    | Phase 4 から 7 の test suite が同じ期待値で通る    |
| Store boundary     | selector 利用位置が container のみに残る           |
| Watcher safety     | cleanup と debounce が分離後も同じ動作をする       |
| 04B / 04C boundary | file selection と preview state の契約が変わらない |

## 多角的チェック観点

| 観点           | このPhaseでの確認内容                                                        | 仕様参照先                                                                                                                                                 |
| -------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| アーキテクチャ | presentational / container / hook / store の責務分離が深まっているか確認する | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` |
| UI/UX          | class 整理や component 分割で表示契約が崩れていないか確認する                | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                                                            |
| IPC / watcher  | cleanup と debounce の分離後も既存チャネル契約を壊していないか確認する       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                                               |
| 品質           | Green を保ったまま重複削減と可読性改善ができているか確認する                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                                                |

## 成果物

| 成果物           | パス                                    | 説明         |
| ---------------- | --------------------------------------- | ------------ |
| リファクタ記録   | `outputs/phase-8/refactoring-log.md`    | 変更理由     |
| 責務境界チェック | `outputs/phase-8/boundary-checklist.md` | 分離後の確認 |

## 完了条件

- [ ] mode / resize / watcher の責務分離方針を定義している
- [ ] presentational / container の分離方針を定義している
- [ ] refactor 後も Phase 4 から 7 の結果を保持する前提を明記している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase 実行時は以下を SubTask として分離する。

1. mode / resize / watcher の責務整理
2. presentational / container 分離
3. regression 安全性確認
4. 成果物更新
5. 完了条件と validator の確認

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-8/` に作成すべき成果物を定義済み
- [ ] `artifacts.json` へ登録すべき成果物を確認済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser` を再実行できる状態

## 次のPhase

[Phase 9: 品質保証](./phase-9-quality-assurance.md)
