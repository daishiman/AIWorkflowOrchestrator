# UT-W3-ANALYTICS-DASHBOARD-001: Analytics ダッシュボード UI・集計機能

| 項目       | 値                                                |
| ---------- | ------------------------------------------------- |
| タスクID   | UT-W3-ANALYTICS-DASHBOARD-001                     |
| 優先度     | 中                                                |
| 依存       | UT-W3-ANALYTICS-HTTP-PROVIDER-001（HTTP送信実装） |
| 関連タスク | UT-W3-ANALYTICS-ADAPTER-001（完了済み）           |
| 作成日     | 2026-04-12                                        |
| issue番号  | #2098                                             |

---

## 目的

収集した analytics イベントを可視化するダッシュボード UI と集計機能を実装し、開発チームが利用状況を把握できるようにする。

---

## 背景

UT-W3-ANALYTICS-ADAPTER-001 で analytics パイプライン（Renderer → IPC → Main → 外部基盤）の基盤が完成した。
UT-W3-ANALYTICS-HTTP-PROVIDER-001 で実際の外部送信が実装されると、蓄積データの可視化が次の価値提供となる。

本タスクは UT-W3-ANALYTICS-ADAPTER-001 の Phase 12 で「scope out」と判定されたため、独立タスクとして管理する。

---

## スコープ

### 含む

- 設定画面内への analytics 統計表示パネル（イベント送信数、最近のイベント一覧）
- オプトアウト状態の可視化（現在の設定状態）
- 開発モードでのイベントログビューア（`NODE_ENV !== 'production'` 時）

### 含まない

- 外部分析基盤のダッシュボード構築（バックエンド側）
- リアルタイム集計基盤（初期版はローカル表示のみ）

---

## 受入基準

- [ ] 設定画面に analytics 統計パネルが表示されること
- [ ] オプトアウトの現在状態（ON/OFF）が確認できること
- [ ] 開発モードで直近の送信イベント一覧が表示されること
- [ ] Playwright E2E テストで動作確認が可能なこと
- [ ] `pnpm typecheck && pnpm lint && pnpm test` が PASS すること

---

## 苦戦箇所（予測）

- **状態所有権**: analytics の集計状態を Renderer Store（Zustand）で管理するか、IPC 経由で Main から取得するかの責務設計が必要
- **開発/本番分岐**: 開発モードのみ表示するコンポーネントの条件分岐をテスト可能な形で設計すること

---

## 完了条件

- [ ] ダッシュボード UI が設定画面に統合されていること
- [ ] 全テストが PASS すること
