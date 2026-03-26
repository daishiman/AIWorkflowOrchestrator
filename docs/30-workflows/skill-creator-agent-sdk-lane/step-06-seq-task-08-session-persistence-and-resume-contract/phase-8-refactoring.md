# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 8                                       |
| 機能名 | session-persistence-and-resume-contract |
| 作成日 | 2026-03-26                              |

## 目的

generic session と workflow session の命名、owner、error code、restore path を簡素化する。

## 実行タスク

- generic / workflow の語を分離する
- checkpoint / session / resume token の語を分離する
- conflict / invalidation / warning の語を分離する

## 参照資料

| 資料名               | パス                                                  | 説明           |
| -------------------- | ----------------------------------------------------- | -------------- |
| Phase 1 抽出表       | `outputs/phase-1/spec-extraction-map.md`              | 初期論点       |
| Phase 2 設計         | `phase-2-design.md`                                   | 元設計         |
| Phase 5 実装         | `phase-5-implementation.md`                           | 実装責務       |
| Phase 6 テスト拡充   | `phase-6-test-expansion.md`                           | edge case 命名 |
| compatibility matrix | `outputs/phase-2/persistence-compatibility-matrix.md` | 命名対象       |
| checkpoint topology  | `outputs/phase-2/checkpoint-topology.md`              | 命名対象       |
| Phase 7 coverage     | `phase-7-coverage-check.md`                           | coverage 用語  |

## 実行手順

### ステップ1: 型名と責務名を整理する

- `phase-5-implementation.md` の component boundary と `phase-6-test-expansion.md` の case 名を同じ vocabulary に揃える。
- generic session summary は `PersistedSession` に残す。
- workflow payload は `SkillCreatorPersistedWorkflowSession` 系へ分離する。
- `resumeTokenEnvelope` と persisted checkpoint を同一物として扱わない。

### ステップ2: エラー語を整理する

- `incompatible` は差分に起因する reject。
- `conflict` は同時書き込みや lease に起因する reject。
- `compatible_with_warning` は allow だが UI へ説明が必要な状態。

## 統合テスト連携

- Phase 4 / 6 の suite 名と error code 名を見直し、rename 後も追跡可能に保つ。
- Phase 9 で命名 drift と public API drift を同時に監査する。

## 成果物

| 成果物           | パス                     | 説明         |
| ---------------- | ------------------------ | ------------ |
| refactoring plan | `phase-8-refactoring.md` | 用語整理本文 |

## 完了条件

- [ ] generic / workflow の語が分離されている
- [ ] checkpoint / token / session の語が分離されている
- [ ] warning / conflict / invalidation の語が分離されている
- [ ] **本Phase内の全タスクを100%実行完了**
