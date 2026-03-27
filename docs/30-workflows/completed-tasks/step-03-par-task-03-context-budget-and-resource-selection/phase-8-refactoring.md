# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 8                                     |
| 機能名 | context-budget-and-resource-selection |
| 作成日 | 2026-03-26                            |

## 目的

source discovery と resource 選択の優先順位、命名、責務境界を簡素化する。

## 実行タスク

- discovery / selection / provenance の命名を揃える
- tier 名の重複をなくす
- fallback と degrade を混同しない表現へ整理する

## 参照資料

| 資料名                   | パス                                          | 説明           |
| ------------------------ | --------------------------------------------- | -------------- |
| Phase 1 抽出表           | `outputs/phase-1/spec-extraction-map.md`      | 初期論点       |
| Phase 5 実装             | `phase-5-implementation.md`                   | 実装対象       |
| Phase 6 テスト拡充       | `phase-6-test-expansion.md`                   | edge case 名称 |
| Phase 7 coverage         | `phase-7-coverage-check.md`                   | coverage 用語  |
| Phase 2 設計             | `phase-2-design.md`                           | 元設計         |
| source resolution matrix | `outputs/phase-2/source-resolution-matrix.md` | 命名対象       |
| budget degrade matrix    | `outputs/phase-2/budget-degrade-matrix.md`    | 命名対象       |

## 実行手順

### ステップ1: 用語を整理する

- source discovery、fallback、degrade、provenance の語を役割別に分離する。

### ステップ2: downstream 伝播名を整理する

- Task04 / 05 / 06 / 08 が読む snapshot 名を揃える。

## 統合テスト連携

- Phase 4 / 6 の suite 名と error code 名が refactor 後も追跡可能か確認する。
- Phase 9 で naming drift を再監査する。

## 成果物

| 成果物           | パス                     | 説明           |
| ---------------- | ------------------------ | -------------- |
| refactoring plan | `phase-8-refactoring.md` | 用語整理の本文 |

## 完了条件

- [ ] 選択基準が重複なく整理されている
- [ ] fixed path fallback と dynamic source discovery の命名が分離されている
- [ ] provenance と route signal の命名が分離されている
- [ ] **本Phase内の全タスクを100%実行完了**
