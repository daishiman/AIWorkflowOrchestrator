# Phase 8 Refactoring Report

## 目的

親参照仕様の読みやすさを維持しつつ、用語と path の正規化を確認した。

## 実施内容

| 対象      | 実施                                                                                     |
| --------- | ---------------------------------------------------------------------------------------- |
| 用語      | `親参照仕様` / `child workflow` / `canonical path` / `spec_created` を正本語彙として固定 |
| path 表記 | parent pointer と master index を completed-task 表記へ統一                              |
| 重複説明  | child 実装詳細は child workflow へ委譲し、親は pointer と sync policy に限定             |

## 結論

追加の本文リファクタリングは不要。以降は Phase 12 の system spec 同期で語彙と path を合わせればよい。
