# Phase 1: 要件定義

## 目的

workflow session、resume、checkpoint の保存対象と未決論点を定義する。

## 実行タスク

- save target 定義
- resume 互換性論点定義
- concurrency / invalidation 論点定義
- source root / resource snapshot drift の互換性論点定義

## 前提依存

- Task02 の workflow state envelope と resume handoff point
- Task07 の route state / handoff state 境界
- 既存 `SessionPersistenceService` / `PersistedSession` の保存モデル

## 成果物

- save target 一覧
- compatibility / invalidation ルール
- 既存 persistence 基盤への mapping 方針

## 境界メモ

- chat history domain model そのものの再設計は対象外
- 初回は contract-first とし、保存機構の全面再実装は後続へ回す

## 完了条件

- [ ] 保存対象と未決論点が整理されている
- [ ] source provenance 変化時の resume 判定条件が整理されている
- [ ] existing `PersistedSession` との mapping 方針が説明できる
- [ ] **本Phase内の全タスクを100%実行完了**
