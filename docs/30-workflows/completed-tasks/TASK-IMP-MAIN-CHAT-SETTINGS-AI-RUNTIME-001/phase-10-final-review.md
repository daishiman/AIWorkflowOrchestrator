# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 10                                         |
| Phase名    | 最終レビュー                               |
| タスクID   | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |
| 前提Phase  | Phase 1〜9                                 |
| 後続Phase  | Phase 11（手動テスト）                     |
| ステータス | not_started                                |
| 作成日     | 2026-03-13                                 |
| 機能名     | main-chat-settings-runtime-sync            |

## 目的

Main Chat / Settings 同期仕様の最終判定を行う。

## 実行タスク

- 最終確認: authority、test matrix、QA 観点、spec sync 対象をまとめて確認する

## 参照資料

| 参照資料            | パス                                          | 内容                                        |
| ------------------- | --------------------------------------------- | ------------------------------------------- |
| Phase 1（要件定義） | `phase-1-requirements.md`                     | 要件前提を確認する                          |
| Phase 2（設計）     | `phase-2-design.md`                           | 設計前提を確認する                          |
| Phase 5（実装）     | `phase-5-implementation.md`                   | 実装結果の前提を確認する                    |
| Phase 9（品質検証） | `phase-9-quality-assurance.md`                | QA 観点を確認する                           |
| apiKeyHandlers      | `apps/desktop/src/main/ipc/apiKeyHandlers.ts` | provider API key authority の最終確認を行う |

## 統合テスト連携

authority、selected config、health、API key 保存状態の release 可否を最終レビューする。

## 成果物

| 成果物           | パス                                      | 内容                       |
| ---------------- | ----------------------------------------- | -------------------------- |
| 最終レビュー報告 | `outputs/phase-10/final-review-report.md` | 最終判定と残論点を記録する |

## 完了条件

- [ ] Phase 1〜9 の前提が矛盾なく接続している

## 次のPhase

- [Phase 11（手動テスト）](./phase-11-manual-test.md) に進む
