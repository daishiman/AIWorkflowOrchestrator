# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 9                                       |
| 機能名 | session-persistence-and-resume-contract |
| 作成日 | 2026-03-26                              |

## 目的

silent resume、single-root 前提、route drift 見落とし、stale write 取りこぼしが残っていないことを確認する。

## 実行タスク

- invalidation reason の再点検
- stale write guard の再点検
- single-root 前提の再点検
- public API drift の再点検

## 参照資料

| 資料名                 | パス                                                  | 説明           |
| ---------------------- | ----------------------------------------------------- | -------------- |
| Phase 5 実装           | `phase-5-implementation.md`                           | 実装対象       |
| Phase 6 test expansion | `phase-6-test-expansion.md`                           | edge case      |
| Phase 7 coverage       | `phase-7-coverage-check.md`                           | coverage 結果  |
| Phase 8 refactoring    | `phase-8-refactoring.md`                              | 命名整理       |
| compatibility matrix   | `outputs/phase-2/persistence-compatibility-matrix.md` | evaluator rule |

## 品質観点

- route / provenance / manifest drift が explicit に判定される
- generic session と workflow session の責務が混ざらない
- `agent:resumeSession` と Skill Creator workflow resume が混ざらない
- `resolvedSkillCreatorRoot` のみ変更時に warning と reject が混同されない
- silent fallback で古い checkpoint を復元しない

## 実行手順

### ステップ1: resume 可否判定を監査する

- version mismatch
- route mismatch
- hash mismatch
- root relocation warning
- lease conflict

### ステップ2: wiring を監査する

- public channel を増やした場合は 4 層整合を確認する。
- public channel を増やしていない場合は internal repository 経路が唯一の restore authority であることを確認する。

## 統合テスト連携

- Phase 10 へ invalidation / conflict / warning の QA 判定を引き渡す。
- Phase 12 に no-op だった public API 更新の根拠を残す。

## 成果物

| 成果物  | パス                           | 説明         |
| ------- | ------------------------------ | ------------ |
| QA 本文 | `phase-9-quality-assurance.md` | QA gate 本文 |

## 完了条件

- [ ] silent resume が起きない
- [ ] stale write / lease conflict が検出できる
- [ ] single-root 前提が残っていない
- [ ] public API drift がない
- [ ] **本Phase内の全タスクを100%実行完了**
