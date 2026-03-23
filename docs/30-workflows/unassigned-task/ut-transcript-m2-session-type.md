# 未タスク指示書: TranscriptSession 型の workspaceSlice 追加

## メタ情報

| 項目         | 内容                                               |
| ------------ | -------------------------------------------------- |
| 未タスクID   | UT-TRANSCRIPT-M2-SESSION-TYPE                      |
| 発生元タスク | TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001 |
| 発生Phase    | Phase 3（設計レビュー）MINOR指摘 M-2               |
| 優先度       | 中                                                 |
| 見積もり規模 | 中規模                                             |

## 概要

`TranscriptSession` 型を `packages/shared/src/types/` に定義し、`workspaceSlice` に `transcriptSessions: TranscriptSession[]` state を追加する。

## 背景

Transcript -> Chat provenance linkage の設計で TranscriptSession 型が定義されたが、workspaceSlice への実装は後続実装タスクで対応する。P31（Zustand 無限ループ）対策として個別セレクタパターンを適用する。

## 受入基準

- [ ] TranscriptSession 型が packages/shared に定義されている
- [ ] workspaceSlice に transcriptSessions state が追加されている
- [ ] 個別セレクタ（useTranscriptSessions 等）が定義されている（P31対策）
- [ ] 既存の workspaceSlice の他の state に影響を与えない
