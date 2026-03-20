# [#1218] [UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001] runtime ルーティング統合クロージャ

## メタ情報

| 項目         | 内容                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| タスクID     | UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001                |
| タスク名     | runtime ルーティング統合クロージャ                                        |
| 分類         | 実装修正                                                                  |
| 優先度       | 高                                                                        |
| 見積もり規模 | 中規模                                                                    |
| ステータス   | 未実施                                                                    |
| 発見元       | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001 Phase 11/12 再監査（2026-03-14） |

## Why（背景・問題点）

### 背景

runtime ルーティング関連クラス（`RuntimePolicyResolver` / `RuntimeSkillCreatorFacade` / `TerminalHandoffBuilder`）は追加済みだが、実行導線への配線が未完了。

### 問題点

- `SkillExecutor` / `AgentExecutor` が受け取る `RuntimeDecision` が上流から供給されていない
- `creatorHandlers.ts` が新規作成されたが、Main composition root / preload 公開APIに未接続
- `TerminalHandoffCard` がUIで未使用

### 放置した場合の影響

- 設計と実装の不一致が継続し、Phase 11 で handoff/permission の画面検証ができない
- 仕様書上は「統一済み」、実装上は「未統一」の状態が固定される

## What（目的・ゴール）

### 目的

runtime ルーティングを Skill / Agent / Creator の実行経路に実際に接続し、画面で検証可能な状態にする。

### 最終ゴール

- `authMode` に応じて `integrated_api` / `terminal_handoff` が実行時に分岐する
- Creator の `plan/execute/improve` runtime 導線が IPC・preload・renderer で到達可能になる
- handoff card が実際の実行結果に応じて表示される

## 完了条件チェックリスト

### 機能要件

- [ ] Skill / Agent / Creator で runtime 分岐が実際に動作する
- [ ] handoff UI が実行結果に連動して表示される

### 品質要件

- [ ] 既存テストが回帰しない
- [ ] 新規配線に対するテストが追加される

### ドキュメント要件

- [ ] Phase 11/12 証跡が更新される
- [ ] system spec と backlog が同期される

## 参照

- 仕様書: `docs/30-workflows/completed-tasks/step-02-par-task-03-skill-agent-runtime-routing/unassigned-task/task-imp-skill-agent-runtime-routing-integration-closure-001.md`
- 親タスク: TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001
