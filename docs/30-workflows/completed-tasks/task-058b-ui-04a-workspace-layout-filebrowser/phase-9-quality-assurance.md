# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                            |
| ------ | --------------------------------------------- |
| Phase  | 9                                             |
| 機能名 | task-058b-ui-04a-workspace-layout-filebrowser |
| 作成日 | 2026-03-10                                    |

## 目的

実装後の型安全性、lint、IPC 利用、権限エラー、監視 cleanup、操作アクセシビリティを一括確認する。

## 実行タスク

- 静的検証: `typecheck`, `lint`, task scope test を実行する
- IPC品質確認: 新規チャネルを追加していないことを確認する
- エラー品質確認: 権限エラーと watch start 失敗時の UI surface を確認する
- UX品質確認: toggle と tree と status bar の keyboard 操作を確認する

## 参照資料

| 資料名                | パス                                                                         | 説明                        |
| --------------------- | ---------------------------------------------------------------------------- | --------------------------- |
| Phase 5               | `phase-5-implementation.md`                                                  | 実装結果                    |
| Phase 6               | `phase-6-test-expansion.md`                                                  | error / a11y 観点           |
| Phase 7               | `phase-7-coverage-check.md`                                                  | coverage 基準               |
| architecture overview | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | レイヤ境界の確認            |
| 状態管理仕様          | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | selector と store 契約      |
| IPC セキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | sender / lifecycle 観点     |
| エラー仕様            | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | 権限エラーと surfacing 観点 |
| 品質要件              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | 静的検証と品質下限          |
| 教訓                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`       | P5 再発防止                 |

## 実行手順

### ステップ1: 静的検証の固定

| 項目            | 内容                                                |
| --------------- | --------------------------------------------------- |
| typecheck       | `WorkspaceView` 周辺の型と hook 戻り値を確認する    |
| lint            | selector 利用位置、cleanup 漏れ、不要依存を確認する |
| task scope test | 04A 対象の unit / integration test を再実行する     |

### ステップ2: 実行品質の固定

| 項目          | 内容                                                                |
| ------------- | ------------------------------------------------------------------- |
| IPC quality   | `workspace:*` / `file:*` の既存チャネルのみを使用しているか確認する |
| error surface | `EACCES`、watch start 失敗、空 workspace の UI 表示を確認する       |
| accessibility | keyboard nav、switch role、status bar の読み上げ前提を確認する      |
| cleanup       | unmount、file 切替、panel close で listener が解除されるか確認する  |

## 統合テスト連携

| 観点          | 具体項目                                                            |
| ------------- | ------------------------------------------------------------------- |
| Type safety   | `WorkspaceView` 周辺の props と hook return が一致する              |
| IPC use       | `workspace:*` / `file:*` のみを使う                                 |
| Error surface | folder add 失敗、file read 失敗、watch start 失敗が画面に反映される |
| Cleanup       | unmount 時に watcher と listener が解除される                       |

## 多角的チェック観点

| 観点               | このPhaseでの確認内容                                                 | 仕様参照先                                                                   |
| ------------------ | --------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| アーキテクチャ     | Renderer / Main / Preload の境界を超える責務追加がないか確認する      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` |
| IPC / セキュリティ | sender 前提、watcher lifecycle、既存チャネル限定が守られるか確認する  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` |
| エラー処理         | 権限エラーや watch start 失敗時の表現が仕様用語と一致するか確認する   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        |
| 品質               | typecheck / lint / task scope test の結果が品質下限を満たすか確認する | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  |

## 成果物

| 成果物                      | パス                                   | 説明                   |
| --------------------------- | -------------------------------------- | ---------------------- |
| 品質レポート                | `outputs/phase-9/quality-report.md`    | static / runtime 品質  |
| セキュリティ / IPC チェック | `outputs/phase-9/ipc-quality-check.md` | 既存チャネル利用の確認 |

## 完了条件

- [ ] 静的検証項目を列挙している
- [ ] IPC 品質観点を列挙している
- [ ] エラー品質観点を列挙している
- [ ] cleanup 観点を列挙している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase 実行時は以下を SubTask として分離する。

1. 静的検証の実行
2. IPC / エラー品質の確認
3. accessibility / cleanup の確認
4. 成果物更新
5. 完了条件と validator の確認

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-9/` に作成すべき成果物を定義済み
- [ ] `artifacts.json` へ登録すべき成果物を確認済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser` を再実行できる状態

## 次のPhase

[Phase 10: 最終レビューゲート](./phase-10-final-review.md)
