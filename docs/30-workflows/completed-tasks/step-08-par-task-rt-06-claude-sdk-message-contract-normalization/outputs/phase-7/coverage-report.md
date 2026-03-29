# Phase 7: カバレッジレポート

## normalizer カバレッジ結果

| 指標               | 結果   | 目標(最低) | 目標(推奨) | 判定 |
| ------------------ | ------ | ---------- | ---------- | ---- |
| Line Coverage      | 99.35% | 80%        | 90%        | PASS |
| Branch Coverage    | 91.22% | 60%        | 70%        | PASS |
| Function Coverage  | 100%   | 80%        | 90%        | PASS |
| Statement Coverage | 99.35% | -          | -          | PASS |

## message 種別カバレッジ

| SDK message 種別                     | テストケース数 | カバレッジ |
| ------------------------------------ | -------------- | ---------- |
| system/init                          | 3              | 100%       |
| assistant (text)                     | 3              | 100%       |
| assistant (permission denial)        | 4              | 100%       |
| assistant (tool error)               | 1              | 100%       |
| result (success)                     | 2              | 100%       |
| result (error)                       | 2              | 100%       |
| result (timeout)                     | 1              | 100%       |
| result (cancelled)                   | 2              | 100%       |
| unknown type                         | 1              | 100%       |
| invalid input (null/undefined/empty) | 3              | 100%       |

## 項目別カバレッジ

| 項目              | 正常系  | 異常系  | カバレッジ |
| ----------------- | ------- | ------- | ---------- |
| sessionId         | 5テスト | 2テスト | 100%       |
| resultSubtype     | 3テスト | 0テスト | 100%       |
| permissionDenials | 4テスト | 1テスト | 100%       |
| sourceProvenance  | 2テスト | 1テスト | 100%       |
| stopReason        | 3テスト | 0テスト | 100%       |
| text              | 4テスト | 1テスト | 100%       |

## ゲート判定: **PASS**

未カバーのライン: L150 (`normalizeAssistantMessage` 内の `text` 分岐) — 99.35% で閾値超過。
