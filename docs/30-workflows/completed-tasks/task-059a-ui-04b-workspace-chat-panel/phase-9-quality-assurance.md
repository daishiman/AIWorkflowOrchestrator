# Phase 9: 品質保証

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| タスクID   | TASK-UI-04B-WORKSPACE-CHAT |
| Phase      | 9                          |
| Phase名    | 品質保証                   |
| カテゴリ   | 品質                       |
| 優先度     | high                       |
| ステータス | completed                  |
| 前提Phase  | Phase 8                    |
| 後続Phase  | Phase 10                   |

## 目的

UI、state、IPC、security、theme、error handling を横断監査し、Phase 10 の最終レビュー入力を整える。

## 実行タスク

- UI 品質監査: zero state、streaming、mention、compact の表示を確認する
- IPC 品質監査: `file:read` / `llm:*` / `conversation:*` の error surface を確認する
- state 品質監査: stale state、double send、cleanup を確認する
- security 監査: preload 境界と direct access 不在を確認する

## 参照資料

| 参照資料                | パス                                         | 説明           |
| ----------------------- | -------------------------------------------- | -------------- |
| 実装サマリー            | `outputs/phase-5/implementation-summary.md`  | Phase 5 成果物 |
| リファクタ記録          | `outputs/phase-8/refactoring-log.md`         | Phase 8 成果物 |
| 責務境界チェック        | `outputs/phase-8/boundary-checklist.md`      | Phase 8 成果物 |
| IPC / conversation 設計 | `outputs/phase-2/ipc-conversation-design.md` | Phase 2 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料       | パス                                                                         | 内容                       |
| -------------- | ---------------------------------------------------------------------------- | -------------------------- |
| security       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | preload / IPC 境界の正本   |
| error handling | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | failure と recovery の正本 |
| quality        | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | 品質監査の正本             |

## 実行手順

### ステップ1: UI / state / IPC を監査する

| 観点     | チェック項目                                             |
| -------- | -------------------------------------------------------- |
| UI       | light / dark、spacing、overflow、empty / error / loading |
| state    | send 中 disable、cleanup、re-render loop 不在            |
| IPC      | conversation create 失敗時に stream を開始しない         |
| security | preload API 経由以外の I/O が無い                        |

## 統合テスト連携

| 観点  | 内容                                                          |
| ----- | ------------------------------------------------------------- |
| smoke | renderer と preload 接続が current build で通ることを確認する |
| error | 異常系 integration と quality 監査を対応付ける                |
| theme | visual regression と manual test 条件を接続する               |

## 多角的チェック観点

| 観点               | このPhaseでの確認内容                                        | 仕様参照先                                                                   |
| ------------------ | ------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| セキュリティ       | preload allowlist、sender 検証、direct access 不在を確認する | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` |
| エラーハンドリング | user-visible error が仕様と一致するか確認する                | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        |
| 品質               | visual / state / IPC を横断して blocking issue を整理する    | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  |

## 成果物

| 成果物           | パス                                   | 説明                       |
| ---------------- | -------------------------------------- | -------------------------- |
| 品質レポート     | `outputs/phase-9/quality-report.md`    | 横断監査結果               |
| IPC 品質チェック | `outputs/phase-9/ipc-quality-check.md` | error / security / cleanup |

## 完了条件

- [x] UI / state / IPC / security を監査している
- [x] 発見事項を Phase 10 へ引き継げる形で記録している
- [x] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. UI 品質監査
2. IPC 品質監査
3. state / cleanup 監査
4. security 監査
5. 成果物と完了条件確認

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] `outputs/phase-9/` に作成すべき成果物を定義済み
- [x] `artifacts.json` へ登録すべき成果物を確認済み
- [x] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel` を再実行できる状態

## 次のPhase

[Phase 10: 最終レビューゲート](./phase-10-final-review.md)
