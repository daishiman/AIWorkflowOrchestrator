# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 4                                         |
| 機能名 | claude-sdk-message-contract-normalization |
| 作成日 | 2026-03-29                                |

## 目的

normalizer の主要 message パターンと edge case を検証するテストケースを定義する。

## 実行タスク

- `system/init` 正規化テスト
- `assistant` message 正規化テスト
- `result` subtype / permission denial 正規化テスト
- `session_id` 欠損時のテスト

## 参照資料

| 資料名  | パス                      | 説明 |
| ------- | ------------------------- | ---- |
| Phase 1 | `phase-1-requirements.md` | 要件 |
| Phase 2 | `phase-2-design.md`       | 設計 |

## 成果物

| 成果物      | パス                             | 説明       |
| ----------- | -------------------------------- | ---------- |
| test matrix | `outputs/phase-4/test-matrix.md` | ケース一覧 |

## 完了条件

- [ ] 主要 message ケースが列挙されている
- [ ] edge case が含まれている
- [ ] **本Phase内の全タスクを100%実行完了**
