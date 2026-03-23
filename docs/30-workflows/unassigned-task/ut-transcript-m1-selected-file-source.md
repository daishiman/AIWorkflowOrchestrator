# 未タスク指示書: SelectedFile source フィールド追加

## メタ情報

| 項目         | 内容                                               |
| ------------ | -------------------------------------------------- |
| 未タスクID   | UT-TRANSCRIPT-M1-SELECTED-FILE-SOURCE              |
| 発生元タスク | TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001 |
| 発生Phase    | Phase 3（設計レビュー）MINOR指摘 M-1               |
| 優先度       | 低                                                 |
| 見積もり規模 | 小規模                                             |

## 概要

`packages/shared/schemas/file-selection.schema.ts` の `SelectedFile` に `source` フィールドを追加し、ファイル背景情報の出所（transcript / manual / system）を追跡可能にする。

## 背景

Transcript -> Chat provenance linkage の設計タスクで、ファイル背景情報の出所追跡が未対応であることが判明した。TranscriptProvenance はメッセージレベルの出所追跡を担うが、ファイルレベルの出所追跡は SelectedFile スキーマの拡張が必要。

## 受入基準

- [ ] SelectedFile に source?: "transcript" | "manual" | "system" フィールドが追加されている
- [ ] 既存のファイル選択フローに影響を与えない（optional フィールド）
- [ ] Transcript からファイルを添付した場合に source = "transcript" が設定される
